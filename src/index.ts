import { createAnalytics, type AppwinAnalytics } from './analytics/client.ts'
import { ConsentStore } from './analytics/consent.ts'
import { EventQueue } from './analytics/event-queue.ts'
import { watchLifecycle } from './analytics/lifecycle.ts'
import { Pipeline, PIPELINE_CONFIG } from './analytics/pipeline.ts'
import { createSender } from './analytics/sender.ts'
import { SessionTracker } from './analytics/session-tracker.ts'
import { Session, type AppwinUserAttributes } from './core/session.ts'
import { createStorage } from './core/storage.ts'
import { SupportClient } from './support/client.ts'
import type { AnalyticsProps, ConsentPurpose, ConsentState } from './analytics/types.ts'
import { SupportRealtime, type SupportRealtimeEvent } from './support/realtime.ts'

export { AppwinError, type AppwinErrorCode } from './core/errors.ts'
export type { AppwinUserAttributes } from './core/session.ts'
export type { SupportClient, SendMessageInput } from './support/client.ts'
export type { SupportRealtime, SupportRealtimeEvent } from './support/realtime.ts'
export type * from './support/types.ts'
export type { AppwinAnalytics } from './analytics/client.ts'
export type {
  AnalyticsConsent,
  ConsentPurpose,
  ConsentState,
  AnalyticsInitOptions,
  AnalyticsInitResult,
  AnalyticsProps,
  AnalyticsUnavailableReason,
  AnalyticsValue,
} from './analytics/types.ts'
export type { RecordErrorOptions } from './analytics/crashes/types.ts'

/** Kept in step with the other artefacts by `sdk/scripts/release.mjs`. */
export const SDK_VERSION = '0.14.0'

const DEFAULT_API_URL = 'https://api.appwin.io'
const DEFAULT_GATEWAY_URL = 'wss://ws.appwin.io'

export interface AppwinOptions {
  /** The App ID of the project, from the dashboard's SDK tab. */
  appId: string
  /**
   * Your own user's id, when they are signed in. Optional: an anonymous
   * visitor is a perfectly good customer, they just come back as a lead.
   * Same as calling `identify(externalId)` right after creation.
   */
  externalId?: string
  /** Your site's release (version, build hash...), for the `app_version` breakdown in analytics. */
  appVersion?: string
  /** Override for self-hosted or staging setups. */
  apiUrl?: string
  gatewayUrl?: string
}

/**
 * Appwin Support, headless.
 *
 * This is the whole product without any interface, which is the layer the
 * widget is built on and the layer a studio uses when it wants its own
 * (ADR-0036 §4). Nothing here touches the DOM, so it runs in a worker, in a
 * test, or server side just as well as in a page.
 *
 * ```ts
 * const appwin = createAppwin({ appId: 'aaaa-...' })
 * const config = await appwin.support.config()
 * const { data } = await appwin.support.conversations()
 * ```
 */
export interface Appwin {
  support: SupportClient
  analytics: AppwinAnalytics
  /**
   * Records an event, from the moment `createAppwin` returns: no
   * `analytics.initialize()` needed. Never throws. `name` must match
   * `^[a-z][a-z0-9_]{0,63}$` and not be a reserved name (`session_start`,
   * `app_open`, `screen_view`...). Props are capped at 20 scalar values,
   * strings at 256 characters. Each event leaves with the purposes granted at
   * the time it is sent.
   */
  track(name: string, props?: AnalyticsProps): void
  /**
   * Records what the visitor answered, typically from a consent banner.
   * Without `purpose`, the answer holds for `analytics`, `marketing` and
   * `advertising`. Everything is granted until the visitor says otherwise;
   * `unknown` keeps events on the device until the answer comes, and refusing
   * the three purges them.
   */
  setConsent(state: ConsentState, purpose?: ConsentPurpose): void
  /**
   * Opens the live connection. Optional: every read works over REST without
   * it, and it is what a page that only shows an unread badge can skip.
   */
  connect(
    onEvent: (event: SupportRealtimeEvent) => void,
    onConnectionChange?: (connected: boolean) => void,
  ): SupportRealtime
  /**
   * Attaches this browser to one of your users, merging the anonymous visitor
   * they were into it. Safe to call on every page: repeating the same id opens
   * no new session. `attributes`, when given, are written as by `updateUser`.
   *
   * @throws {AppwinError} `bad_request` when `externalId` is empty.
   */
  identify(externalId: string, attributes?: AppwinUserAttributes): Promise<void>
  /**
   * Writes what you know about the current user (email, name, plan...). An
   * omitted field is left untouched. Works on an anonymous visitor too.
   */
  updateUser(attributes: AppwinUserAttributes): Promise<void>
  /**
   * Call it when your own user signs out: ends the session and continues as a
   * new anonymous visitor, so the next person on a shared machine does not
   * read the previous one's support. Never rejects on a network failure.
   */
  logout(): Promise<void>
}

export function createAppwin(options: AppwinOptions): Appwin {
  if (!options.appId) {
    throw new Error('[appwin] `appId` is required. Find it in the dashboard, SDK tab.')
  }

  const apiUrl = stripTrailingSlash(options.apiUrl ?? DEFAULT_API_URL)
  const gatewayUrl = stripTrailingSlash(options.gatewayUrl ?? DEFAULT_GATEWAY_URL)

  const storage = createStorage(options.appId)
  const session = new Session({
    appId: options.appId,
    baseUrl: apiUrl,
    storage,
    sdkVersion: SDK_VERSION,
    ...(options.appVersion ? { appVersion: options.appVersion } : {}),
  })

  // Identity is attached in the background: making `createAppwin` async would
  // force every host page to await before it can even render a launcher.
  if (options.externalId) void session.identify(options.externalId)

  const support = new SupportClient(session)
  const sessions = new SessionTracker(storage, {
    timeoutMs: PIPELINE_CONFIG.sessionTimeoutMs,
    maxAgeMs: PIPELINE_CONFIG.maxSessionAgeMs,
  })
  const consent = new ConsentStore(storage)
  const pipeline = new Pipeline({
    queue: new EventQueue(createStorage(options.appId, 'sessionStorage'), PIPELINE_CONFIG.maxQueueEvents),
    sessions,
    consent,
    send: createSender(session),
  })
  // Whether Analytics is in the plan no longer gates events: they also feed journeys.
  pipeline.enableUploads()
  // No DOM in a worker, a test or on a server: no lifecycle there, so no session of its own either.
  if (typeof document !== 'undefined') {
    watchLifecycle(pipeline)
    if (document.visibilityState !== 'hidden') pipeline.onForeground()
  }
  const runtime = createAnalytics({ session, storage, sdkVersion: SDK_VERSION, pipeline, consent, sessions })

  return {
    support,
    analytics: runtime.analytics,
    track: runtime.track,
    setConsent: runtime.setConsent,
    connect(onEvent, onConnectionChange) {
      const realtime = new SupportRealtime({
        session,
        gatewayUrl,
        onEvent,
        ...(onConnectionChange ? { onConnectionChange } : {}),
      })
      void realtime.connect()
      return realtime
    },
    identify: (externalId, attributes) => session.identify(externalId, attributes),
    updateUser: (attributes) => session.updateUser(attributes),
    async logout() {
      // The queued events belong to the visitor who is leaving, send them under their token.
      await runtime.analytics.flush()
      await session.logout()
    },
  }
}

function stripTrailingSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url
}
