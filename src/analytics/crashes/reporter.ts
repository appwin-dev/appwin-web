import type { ConsentStore } from '../consent.ts'
import { SerialDrain, type DrainStep } from '../serial-drain.ts'
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
  private readonly deps: CrashReporterDeps
  private readonly now: () => number
  private readonly drain: SerialDrain

  constructor(deps: CrashReporterDeps) {
    this.deps = deps
    this.now = deps.now ?? Date.now
    this.drain = new SerialDrain({ step: () => this.sendNextBatch(), canRun: () => this.canUpload() })
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
    this.drain.cancelRetry()
    this.deps.queue.clear()
  }

  /** Called after the consent store was updated. */
  onConsentChange(consent: AnalyticsConsent): void {
    if (consent === 'denied') {
      this.drain.cancelRetry()
      this.deps.queue.clear()
    } else if (consent === 'granted') {
      void this.flush()
    }
  }

  flush(): Promise<void> {
    return this.drain.run()
  }

  private async sendNextBatch(): Promise<DrainStep> {
    const { queue, send } = this.deps
    const batch = queue.nextBatch(MAX_REPORT_BYTES)
    if (batch.length === 0) return 'idle'
    if ((await send(batch)) === 'retry') return 'retry'
    queue.remove(batch)
    return 'next'
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
}
