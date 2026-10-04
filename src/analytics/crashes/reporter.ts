import type { ConsentStore } from '../consent.ts'
import { backoffDelay } from '../pipeline.ts'
import type { AnalyticsConsent } from '../types.ts'
import type { CrashQueue } from './crash-queue.ts'
import { buildReport, MAX_REPORT_BYTES, type ThrownValue } from './report.ts'
import type { SendCrashes } from './sender.ts'
import { frameFromLocation, parseStack, type StackParseOptions } from './stack-parser.ts'
import type { CrashContext, CrashFrame, CrashKind } from './types.ts'

export const CRASH_CONFIG = {
  /** An error thrown in a render loop or a timer would otherwise flood the queue. */
  dedupeWindowMs: 5_000,
  maxReportsPerPage: 10,
}

export interface CrashReporterDeps {
  queue: CrashQueue
  consent: ConsentStore
  send: SendCrashes
  context: () => CrashContext
  stack: StackParseOptions
  now?: () => number
}

export interface CapturedError {
  kind: CrashKind
  thrown: ThrownValue
  /** Where the browser says the error happened, used when there is no stack to parse. */
  location?: { url?: string; line?: number; col?: number }
}

/**
 * Turns errors into reports, persists them, then sends. No DOM in here: the
 * browser hooks live in `handlers.ts`.
 *
 * Each report is written to the queue before the request leaves, so a tab
 * closed mid-send loses nothing; the server deduplicates on `crashId`.
 */
export class CrashReporter {
  private uploadsEnabled = false
  private isShutDown = false
  private captured = 0
  private readonly recent = new Map<string, number>()
  private inFlight: Promise<void> | null = null
  private flushRequested = false
  private attempt = 0
  private retryTimer: ReturnType<typeof setTimeout> | null = null
  private readonly deps: CrashReporterDeps
  private readonly now: () => number

  constructor(deps: CrashReporterDeps) {
    this.deps = deps
    this.now = deps.now ?? Date.now
  }

  /** Never throws: it runs inside the host page's error handling. */
  capture(error: CapturedError): void {
    try {
      if (this.isShutDown || this.deps.consent.value === 'denied') return
      if (this.captured >= CRASH_CONFIG.maxReportsPerPage) return

      const frames = this.framesOf(error)
      if (this.isDuplicate(error.thrown, frames)) return
      this.captured += 1

      const report = buildReport(error.kind, error.thrown, frames, this.deps.context(), this.now())
      this.deps.queue.push(report)
      void this.flush()
    } catch {
      // A crash reporter that crashes the page it watches is worse than none.
    }
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

  /** Called after the consent store was updated. */
  onConsentChange(consent: AnalyticsConsent): void {
    if (consent === 'denied') {
      this.cancelRetry()
      this.deps.queue.clear()
    } else if (consent === 'granted') {
      void this.flush()
    }
  }

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
      const batch = queue.nextBatch(MAX_REPORT_BYTES)
      if (batch.length === 0) return

      const outcome = await send(batch)
      if (outcome === 'retry') {
        this.scheduleRetry()
        return
      }
      queue.remove(batch)
      this.attempt = 0
    }
  }

  private canUpload(): boolean {
    return this.uploadsEnabled && !this.isShutDown && this.deps.consent.value === 'granted'
  }

  private framesOf(error: CapturedError): CrashFrame[] {
    const frames = parseStack(error.thrown.stack, this.deps.stack)
    if (frames.length > 0 || !error.location) return frames
    const { url, line, col } = error.location
    return frameFromLocation(url, line, col, this.deps.stack)
  }

  private isDuplicate(thrown: ThrownValue, frames: CrashFrame[]): boolean {
    const now = this.now()
    for (const [key, at] of this.recent) {
      if (now - at > CRASH_CONFIG.dedupeWindowMs) this.recent.delete(key)
    }
    const top = frames[0]
    const key = [
      thrown.type,
      thrown.message ?? '',
      top?.fn ?? '',
      top?.file ?? '',
      top?.line ?? '',
    ].join('|')
    if (this.recent.has(key)) return true
    this.recent.set(key, now)
    return false
  }

  private scheduleRetry(): void {
    const delay = backoffDelay(this.attempt)
    this.attempt += 1
    if (this.retryTimer) clearTimeout(this.retryTimer)
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
