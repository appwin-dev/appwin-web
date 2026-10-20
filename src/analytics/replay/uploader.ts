import { AppwinError } from '../../core/errors.ts'
import type { Session } from '../../core/session.ts'
import { failureOutcome } from '../sender.ts'
import { SerialDrain, type DrainStep } from '../serial-drain.ts'
import { REPLAY_LIMITS } from './config.ts'
import type { SegmentMeta } from './segment.ts'

export interface QueuedSegment {
  meta: SegmentMeta
  /** Gzipped rrweb events. */
  blob: Blob
}

/**
 * - `ok`: stored, or deduplicated: delete it.
 * - `drop`: refused for good (malformed, too large): delete it, retrying cannot help.
 * - `retry`: transient, keep it and back off.
 * - `disabled`: replay is off for this app server side (403): stop recording altogether.
 */
export type ReplaySendOutcome = 'ok' | 'drop' | 'retry' | 'disabled'

export type SendSegment = (segment: QueuedSegment, keepalive: boolean) => Promise<ReplaySendOutcome>

const PATH = '/api/sdk/v1/replays/segments'

export function createReplaySender(session: Session): SendSegment {
  return async ({ meta, blob }, keepalive) => {
    const form = new FormData()
    form.append('meta', JSON.stringify({ ...meta, sentAt: new Date().toISOString() }))
    form.append('segment', blob, 'segment.json.gz')
    try {
      await session.fetch<unknown>({ method: 'POST', path: PATH, body: form, ...(keepalive ? { keepalive } : {}) })
      return 'ok'
    } catch (err) {
      // On this route a 403 is the replay toggle, not the declared origins: analytics, on the
      // same origin, was accepted to get here.
      if (err instanceof AppwinError && err.status === 403) return 'disabled'
      return failureOutcome(err, 'replay segment')
    }
  }
}

/** Bytes a multipart body adds around the file: boundaries, part headers, the `meta` JSON. */
const MULTIPART_OVERHEAD_BYTES = 2_048

export interface ReplayUploaderDeps {
  send: SendSegment
  onDisabled: () => void
}

/**
 * Sends segments in order, one at a time, and keeps those the network refused
 * for later. In memory only: unlike events, a replay is not worth a storage
 * quota, and a tab that closes takes its last seconds with it.
 */
export class ReplayUploader {
  private readonly queue: QueuedSegment[] = []
  private disabled = false
  /**
   * The page is hidden and may never come back. The head of the queue then
   * goes out as `keepalive` when it fits the browser's limit; a larger one is
   * sent anyway, on the chance the page survives the request.
   */
  leaving = false
  private readonly deps: ReplayUploaderDeps
  private readonly drain: SerialDrain

  constructor(deps: ReplayUploaderDeps) {
    this.deps = deps
    this.drain = new SerialDrain({ step: () => this.sendHead(), canRun: () => !this.disabled })
  }

  get size(): number {
    return this.queue.length
  }

  push(segment: QueuedSegment): void {
    if (this.disabled) return
    if (segment.blob.size > REPLAY_LIMITS.segmentMaxBytes) return
    this.queue.push(segment)
    if (this.queue.length > REPLAY_LIMITS.maxQueuedSegments) this.queue.shift()
    void this.flush()
  }

  /**
   * Waits out a pending backoff, unless the page is leaving: a hidden tab may
   * never fire the retry timer, so the queue goes now, with `keepalive`.
   */
  flush(): Promise<void> {
    if (this.drain.retryPending) {
      if (!this.leaving) return Promise.resolve()
      this.drain.cancelRetry()
    }
    return this.drain.run()
  }

  clear(): void {
    this.queue.length = 0
    this.drain.cancelRetry()
  }

  private async sendHead(): Promise<DrainStep> {
    const head = this.queue[0]
    if (!head) return 'idle'
    const keepalive = this.leaving && head.blob.size + MULTIPART_OVERHEAD_BYTES <= REPLAY_LIMITS.keepaliveMaxBytes
    const outcome = await this.deps.send(head, keepalive)
    if (outcome === 'disabled') {
      this.disabled = true
      this.clear()
      this.deps.onDisabled()
      return 'idle'
    }
    if (outcome === 'retry') return 'retry'
    // The queue may have been cleared while the request was out.
    if (this.queue[0] === head) this.queue.shift()
    return 'next'
  }
}
