import { randomId } from '../core/device.ts'
import type { ConsentStore } from './consent.ts'
import type { EventQueue } from './event-queue.ts'
import type { SendBatch } from './sender.ts'
import { SerialDrain, type DrainStep } from './serial-drain.ts'
import type { SessionTracker } from './session-tracker.ts'
import type { AnalyticsConsent, AnalyticsProps, WireEvent } from './types.ts'

export { backoffDelay } from './serial-drain.ts'

/** Same values as `AnalyticsConfig` in the iOS and Android SDKs, backoff aside (`BACKOFF`). */
export const PIPELINE_CONFIG = {
  flushAt: 20,
  flushIntervalMs: 30_000,
  maxQueueEvents: 1_000,
  maxBatchEvents: 500,
  maxBatchBytes: 60_000,
  sessionTimeoutMs: 30 * 60_000,
  maxSessionAgeMs: 24 * 60 * 60_000,
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
  private cooldownUntil = 0
  private readonly deps: PipelineDeps
  private readonly now: () => number
  private readonly drain: SerialDrain

  constructor(deps: PipelineDeps) {
    this.deps = deps
    this.now = deps.now ?? Date.now
    this.drain = new SerialDrain({ step: () => this.sendNextBatch(), canRun: () => this.canUpload() })
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
    this.drain.cancelRetry()
    this.deps.queue.clear()
  }

  setConsent(consent: AnalyticsConsent): void {
    this.deps.consent.set(consent)
    if (consent === 'denied') {
      this.drain.cancelRetry()
      this.deps.queue.clear()
      this.deps.sessions.reset()
    } else if (consent === 'granted') {
      void this.flush()
    }
  }

  /** Every trigger lands here; `await flush()` covers what was queued before the call. */
  flush(): Promise<void> {
    return this.drain.run()
  }

  private async sendNextBatch(): Promise<DrainStep> {
    const { queue, send } = this.deps
    const batch = queue.nextBatch({
      maxEvents: PIPELINE_CONFIG.maxBatchEvents,
      maxBytes: PIPELINE_CONFIG.maxBatchBytes,
    })
    if (batch.length === 0) return 'idle'

    const outcome = await send(batch)
    if (outcome === 'retry') return 'retry'
    queue.remove(batch)
    // The cooldown turns `canUpload` false, which is what ends the drain.
    if (outcome === 'quota_exceeded') this.cooldownUntil = this.now() + PIPELINE_CONFIG.quotaCooldownMs
    return 'next'
  }

  private canUpload(): boolean {
    return (
      this.uploadsEnabled && this.deps.consent.value === 'granted' && this.now() >= this.cooldownUntil
    )
  }
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
