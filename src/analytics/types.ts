export type AnalyticsValue = string | number | boolean

export type AnalyticsProps = Record<string, AnalyticsValue>

/**
 * `granted` is the default (opt-out). With `unknown`, events are captured but
 * never uploaded until the answer comes: `granted` sends the backlog, `denied`
 * purges it and mutes capture.
 */
export type AnalyticsConsent = 'granted' | 'unknown' | 'denied'

export type AnalyticsInitResult =
  | { ready: true }
  | { ready: false; reason: AnalyticsUnavailableReason }

/**
 * - `plan` / `disabled`: not in the plan, or switched off on this app in the dashboard.
 * - `origin_not_allowed`: this site's domain is not in the app's web domains (dashboard, SDK tab).
 * - `refused`: the server refused the session for another reason, such as an unknown App ID.
 * - `unreachable`: no answer, captured events wait for the next page load.
 */
export type AnalyticsUnavailableReason =
  | 'plan'
  | 'disabled'
  | 'origin_not_allowed'
  | 'refused'
  | 'unreachable'

export interface AnalyticsInitOptions {
  /** Emits a `screen_view` per page, named after its path. Default `true`. */
  pageViews?: boolean
  /**
   * Reports uncaught errors and unhandled promise rejections, and enables
   * `recordError()`. Default `true`. Turn it off when another tool already
   * reports them and you do not want them twice.
   */
  crashReporting?: boolean
  /**
   * Session replay, when it is switched on for this app in the dashboard
   * (Analytics, Replays). Default `true`, which follows the dashboard; `false`
   * keeps this site from ever recording, whatever the dashboard says.
   * Recording also needs consent `granted`; inputs are always masked.
   */
  sessionReplay?: boolean
}

/** One event exactly as `POST /api/sdk/v1/events` ingests it. */
export interface WireEvent {
  eventId: string
  name: string
  occurredAt: string
  sessionId?: string
  screen?: string
  props?: AnalyticsProps
}
