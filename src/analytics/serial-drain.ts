/** Same values as `backoffBaseMs` / `backoffCapMs` of `AnalyticsConfig` in the iOS and Android SDKs. */
export const BACKOFF = { baseMs: 2_000, capMs: 300_000 }

/** Multiplicative jitter, so browsers that failed together do not retry at the same instant. */
export function backoffDelay(attempt: number, random: () => number = Math.random): number {
  const raw = Math.min(BACKOFF.capMs, BACKOFF.baseMs * 2 ** Math.min(attempt, 30))
  return raw * (0.5 + random() * 0.5)
}

/**
 * - `next`: the head went out (or was dropped for good), go on with the queue.
 * - `idle`: nothing left to send, or the caller stopped on its own terms.
 * - `retry`: transient failure, keep the head and back off.
 */
export type DrainStep = 'next' | 'idle' | 'retry'

export interface SerialDrainDeps {
  /** Sends the head of the caller's queue. */
  step: () => Promise<DrainStep>
  /** Read before each step: uploads off, consent, cooldown. */
  canRun: () => boolean
}

/**
 * One request at a time, in queue order, with exponential backoff on
 * transient failures. Shared by the event pipeline, crash reports and replay
 * segments, which differ only in what they send.
 */
export class SerialDrain {
  private inFlight: Promise<void> | null = null
  private rerun = false
  private attempt = 0
  private retryTimer: ReturnType<typeof setTimeout> | null = null
  private readonly deps: SerialDrainDeps

  constructor(deps: SerialDrainDeps) {
    this.deps = deps
  }

  get retryPending(): boolean {
    return this.retryTimer !== null
  }

  /**
   * A call arriving mid-drain gets one more pass and resolves only after it,
   * so `await run()` always covers what was queued before it.
   */
  run(): Promise<void> {
    if (!this.deps.canRun()) return this.inFlight ?? Promise.resolve()
    if (this.inFlight) {
      this.rerun = true
      return this.inFlight
    }
    this.inFlight = this.drainUntilSettled().finally(() => {
      this.inFlight = null
    })
    return this.inFlight
  }

  cancelRetry(): void {
    if (this.retryTimer) clearTimeout(this.retryTimer)
    this.retryTimer = null
    this.attempt = 0
  }

  private async drainUntilSettled(): Promise<void> {
    do {
      this.rerun = false
      await this.drain()
    } while (this.rerun && this.deps.canRun() && !this.retryTimer)
  }

  private async drain(): Promise<void> {
    while (this.deps.canRun()) {
      const outcome = await this.deps.step()
      if (outcome === 'idle') return
      if (outcome === 'retry') {
        this.scheduleRetry()
        return
      }
      this.attempt = 0
    }
  }

  private scheduleRetry(): void {
    const delay = backoffDelay(this.attempt)
    this.attempt += 1
    if (this.retryTimer) clearTimeout(this.retryTimer)
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null
      void this.run()
    }, delay)
  }
}
