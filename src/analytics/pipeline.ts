import { randomId } from '../core/device.ts'
import type { ConsentStore } from './consent.ts'
import type { EventQueue } from './event-queue.ts'
import type { SendBatch } from './sender.ts'
import type { SessionTracker } from './session-tracker.ts'
import type { AnalyticsConsent, AnalyticsProps, WireEvent } from './types.ts'

/** Same values as `AnalyticsConfig` in the iOS and Android SDKs. */
export const PIPELINE_CONFIG = {
  flushAt: 20,
  flushIntervalMs: 30_000,
  maxQueueEvents: 1_000,
  maxBatchEvents: 500,
  maxBatchBytes: 60_000,
  sessionTimeoutMs: 30 * 60_000,
  maxSessionAgeMs: 24 * 60 * 60_000,
  backoffBaseMs: 2_000,
  backoffCapMs: 300_000,
  quotaCooldownMs: 60 * 60_000,
}

export interface PipelineDeps {
  queue: EventQueue
  sessions: SessionTracker
  consent: ConsentStore
  send: SendBatch
  now?: () => number
}

/**
 * Capture, queue and upload. No DOM in here: the browser wiring lives in
 * `lifecycle.ts`, which keeps this testable in plain Node.
 *
 * Uploads wait for `enableUploads()`, called once the server confirms
 * analytics is on for this app. Delivery is at least once, the server
 * deduplicates on `eventId`.
 */
export class Pipeline {
  private uploadsEnabled = false
  private isShutDown = false
  private inFlight: Promise<void> | null = null
  private flushRequested = false
  private attempt = 0
  private retryTimer: ReturnType<typeof setTimeout> | null = null
  private cooldownUntil = 0
  private readonly deps: PipelineDeps
  private readonly now: () => number

  constructor(deps: PipelineDeps) {
    this.deps = deps
    this.now = deps.now ?? Date.now
  }

  enqueue(name: string, extras: { screen?: string; props?: AnalyticsProps } = {}): void {
    const { queue, sessions, consent } = this.deps
    if (this.isShutDown || consent.value === 'denied') return

    for (const event of sessions.touch()) {
      queue.push(
        wireEvent(event.name, event.occurredAt, event.sessionId, {
          ...(event.durationMs !== undefined ? { props: { duration_ms: event.durationMs } } : {}),
        }),
      )
    }
    queue.push(wireEvent(name, this.now(), sessions.sessionId, extras))

    if (queue.size >= PIPELINE_CONFIG.flushAt) void this.flush()
  }

  enableUploads(): void {
    this.uploadsEnabled = true
    void this.flush()
  }

  /** Analytics is off for this app: nothing captured may be kept. */
  shutdown(): void {
    this.isShutDown = true
    this.uploadsEnabled = false
    this.cancelRetry()
    this.deps.queue.clear()
  }

  setConsent(consent: AnalyticsConsent): void {
    this.deps.consent.set(consent)
    if (consent === 'denied') {
      this.cancelRetry()
      this.deps.queue.clear()
      this.deps.sessions.reset()
    } else if (consent === 'granted') {
      void this.flush()
    }
  }

  /**
   * Every trigger lands here. A call arriving mid-flush gets one more pass and
   * resolves only after it, so `await flush()` always covers what was queued.
   */
  flush(): Promise<void> {
    if (!this.canUpload()) return Promise.resolve()
    if (this.inFlight) {
      this.flushRequested = true
      return this.inFlight
    }

    this.inFlight = this.drainUntilSettled().finally(() => {
      this.inFlight = null
    })
    return this.inFlight
  }

  private async drainUntilSettled(): Promise<void> {
    do {
      this.flushRequested = false
      await this.drain()
    } while (this.flushRequested && this.canUpload() && !this.retryTimer)
  }

  private async drain(): Promise<void> {
    const { queue, send } = this.deps
    while (this.canUpload()) {
      const batch = queue.nextBatch({
        maxEvents: PIPELINE_CONFIG.maxBatchEvents,
        maxBytes: PIPELINE_CONFIG.maxBatchBytes,
      })
      if (batch.length === 0) return

      const outcome = await send(batch)
      if (outcome === 'retry') {
        this.scheduleRetry()
        return
      }

      queue.remove(batch)
      this.attempt = 0
      if (outcome === 'quota_exceeded') {
        this.cooldownUntil = this.now() + PIPELINE_CONFIG.quotaCooldownMs
        return
      }
    }
  }

  private canUpload(): boolean {
    return (
      this.uploadsEnabled && this.deps.consent.value === 'granted' && this.now() >= this.cooldownUntil
    )
  }

  private scheduleRetry(): void {
    const delay = backoffDelay(this.attempt)
    this.attempt += 1
    this.cancelRetry()
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null
      void this.flush()
    }, delay)
  }

  private cancelRetry(): void {
    if (this.retryTimer) clearTimeout(this.retryTimer)
    this.retryTimer = null
    this.attempt = 0
  }
}

/** Multiplicative jitter, so browsers that failed together do not retry at the same instant. */
export function backoffDelay(attempt: number, random: () => number = Math.random): number {
  const raw = Math.min(
    PIPELINE_CONFIG.backoffCapMs,
    PIPELINE_CONFIG.backoffBaseMs * 2 ** Math.min(attempt, 30),
  )
  return raw * (0.5 + random() * 0.5)
}

function wireEvent(
  name: string,
  occurredAt: number,
  sessionId: string | null,
  extras: { screen?: string; props?: AnalyticsProps },
): WireEvent {
  return {
    eventId: randomId(),
    name,
    occurredAt: new Date(occurredAt).toISOString(),
    ...(sessionId ? { sessionId } : {}),
    ...(extras.screen ? { screen: extras.screen } : {}),
    ...(extras.props ? { props: extras.props } : {}),
  }
}
