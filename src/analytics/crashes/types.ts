/** Options of `appwin.analytics.recordError()`. */
export interface RecordErrorOptions {
  /**
   * Reports the error as a crash instead of a non-fatal error, for an error
   * your own boundary caught but that left the page unusable. Default `false`.
   */
  fatal?: boolean
}

// Local mirror of `CrashReportSchema` (`@app-win/contracts`, ADR-0056): the
// SDK ships without the contracts package, like `WireEvent` for events.

export type CrashKind = 'crash' | 'non_fatal'

export interface CrashFrame {
  fn: string
  file?: string
  line?: number
  col?: number
  module?: string
  inApp: boolean
}

export interface CrashBreadcrumb {
  at: string
  type: 'screen' | 'event'
  name: string
}

/** One report exactly as `POST /api/sdk/v1/crashes` ingests it. */
export interface CrashReport {
  crashId: string
  kind: CrashKind
  runtime: 'web'
  occurredAt: string
  sessionId?: string
  screen?: string
  exception: { type: string; message?: string }
  frames: CrashFrame[]
  app: { version: string }
  device: { os: string; model: string }
  sdkVersion: string
  breadcrumbs?: CrashBreadcrumb[]
}

/** What the report needs from the rest of the SDK, read at capture time. */
export interface CrashContext {
  appVersion: string
  os: string
  model: string
  sdkVersion: string
  sessionId: string | null
  screen: string | null
  breadcrumbs: CrashBreadcrumb[]
}
