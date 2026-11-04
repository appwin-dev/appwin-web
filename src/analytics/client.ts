import { fetchProductStatuses, type ProductStatus } from '../core/availability.ts'
import { AppwinError } from '../core/errors.ts'
import type { Session } from '../core/session.ts'
import type { AppwinStorage } from '../core/storage.ts'
import type { ConsentStore } from './consent.ts'
import { Breadcrumbs } from './crashes/breadcrumbs.ts'
import { startCrashReporting, type CrashReporting } from './crashes/index.ts'
import { describeThrown } from './crashes/report.ts'
import type { RecordErrorOptions } from './crashes/types.ts'
import { watchPageViews } from './page-views.ts'
import type { Pipeline } from './pipeline.ts'
import { parseReplaySettings } from './replay/config.ts'
import { startReplay, type SessionReplay } from './replay/index.ts'
import type { SessionTracker } from './session-tracker.ts'
import type {
  AnalyticsConsent,
  AnalyticsInitOptions,
  AnalyticsInitResult,
  AnalyticsProps,
  ConsentPurpose,
  ConsentState,
} from './types.ts'
import { isCustomEventName, sanitizeProps, sanitizeScreen } from './validation.ts'

/**
 * Appwin Analytics: behavioral events for the dashboards, funnels and
 * experiments of the Appwin studio.
 *
 * ```ts
 * await appwin.analytics.initialize()
 * appwin.track('purchase', { plan: 'pro', seats: 3 })
 * ```
 *
 * Events, sessions and consent live on the root of `createAppwin` and work
 * without `initialize()`; this one adds crash reports, page views and replay.
 */
export interface AppwinAnalytics {
  /**
   * Starts crash reports, page views and session replay, once the plan and
   * the dashboard toggle allow it. Calling it again returns the first result.
   */
  initialize(options?: AnalyticsInitOptions): Promise<AnalyticsInitResult>
  /**
   * Queues a custom event. Never throws. `name` must match
   * `^[a-z][a-z0-9_]{0,63}$` and not be a reserved name (`session_start`,
   * `screen_view`...). Props are capped at 20 scalar values, strings at 256
   * characters.
   *
   * @deprecated Use `appwin.track`.
   */
  track(name: string, props?: AnalyticsProps): void
  /** Records a `screen_view`. Only needed with `pageViews: false`, or for views that are not pages. */
  screen(name: string): void
  /** Uploads the queue now. Rarely needed: it already flushes on volume, on a timer and when the page is hidden. */
  flush(): Promise<void>
  /**
   * Answers for the three purposes at once. Can be called before `initialize()`,
   * typically from a consent banner. See {@link AnalyticsConsent}.
   *
   * @deprecated Use `appwin.setConsent`.
   */
  setConsent(consent: AnalyticsConsent): void
  /**
   * Starts session replay from now, after `initialize({ sessionReplay: 'manual' })`.
   * No-op when replay was passed `false`, when the dashboard has it off, or
   * before `initialize()` has finished. Consent `granted` is still required
   * to record; a call made earlier waits for it.
   */
  startSessionReplay(): void
  /** Stops the recording started by {@link AppwinAnalytics.startSessionReplay}. A later start begins a new one. */
  stopSessionReplay(): void
  /**
   * Reports an error your code caught, with its stack and the last screens
   * and events before it. Never throws. Ignored before `initialize()` and with
   * `crashReporting: false`. Uncaught errors and unhandled rejections are
   * reported on their own, without this call.
   *
   * ```ts
   * try {
   *   await checkout()
   * } catch (error) {
   *   appwin.analytics.recordError(error)
   * }
   * ```
   */
  recordError(error: unknown, options?: RecordErrorOptions): void
}

export interface AnalyticsDeps {
  session: Session
  /** Shared by every tab of the site. */
  storage: AppwinStorage
  sdkVersion: string
  /** Built by `createAppwin`: events flow from creation, this only adds the optional parts on top. */
  pipeline: Pipeline
  consent: ConsentStore
  sessions: SessionTracker
}

/** What the root of `createAppwin` exposes, next to the `analytics` product. */
export interface AnalyticsRuntime {
  analytics: AppwinAnalytics
  track(name: string, props?: AnalyticsProps): void
  setConsent(state: ConsentState, purpose?: ConsentPurpose): void
}

export function createAnalytics({
  session,
  storage,
  sdkVersion,
  pipeline,
  consent,
  sessions,
}: AnalyticsDeps): AnalyticsRuntime {
  const breadcrumbs = new Breadcrumbs()

  let started: Promise<AnalyticsInitResult> | null = null
  let crashes: CrashReporting | null = null
  let replay: SessionReplay | null = null
  /** Set once availability says replay is on. `null` when it is off or init passed `false`. */
  let replaySettings: ReturnType<typeof parseReplaySettings> | null = null
  /** `initialize({ sessionReplay: false })`: this site must never record, even if start is called later. */
  let replayBlocked = false
  /** A start that arrived before availability came back. */
  let replayWanted = false

  const beginReplay = (): void => {
    if (replay || replayBlocked || !replaySettings) return
    replay = startReplay({
      session,
      storage,
      consent,
      sessions,
      settings: replaySettings,
      initialScreen: breadcrumbs.screen,
    })
  }

  const endReplay = (): void => {
    replay?.stop()
    replay = null
  }

  const recordScreen = (name: string) => {
    const screen = sanitizeScreen(name)
    breadcrumbs.add('screen', screen)
    pipeline.enqueue('screen_view', { screen })
    replay?.screen(screen)
  }

  async function start(options: AnalyticsInitOptions): Promise<AnalyticsInitResult> {
    const stopPageViews =
      options.pageViews === false
        ? () => {}
        : watchPageViews(recordScreen)
    if (options.crashReporting !== false) {
      crashes = startCrashReporting({ session, storage, consent, sessions, breadcrumbs, sdkVersion })
    }

    const shutdown = (result: AnalyticsInitResult, detail: string): AnalyticsInitResult => {
      stopPageViews()
      crashes?.stop()
      crashes = null
      console.warn(`[appwin] analytics did not start: ${detail}`)
      return result
    }

    let status: ProductStatus | null
    let replayStatus: ProductStatus | null
    try {
      ;({ analytics: status, replay: replayStatus } = await fetchProductStatuses(session, storage, [
        'analytics',
        'replay',
      ]))
    } catch (err) {
      const reason = err instanceof AppwinError && err.code === 'origin_not_allowed' ? 'origin_not_allowed' : 'refused'
      return shutdown({ ready: false, reason }, err instanceof Error ? err.message : String(err))
    }
    // Unreachable without cache: keep capturing, the next page load asks again.
    if (!status) return { ready: false, reason: 'unreachable' }
    if (!status.enabled) {
      const reason = status.reason ?? 'disabled'
      return shutdown({ ready: false, reason }, `unavailable for this app (${reason}).`)
    }

    crashes?.reporter.enableUploads()
    const replayMode = options.sessionReplay ?? true
    if (replayMode === false) replayBlocked = true
    else if (replayStatus?.enabled) {
      replaySettings = parseReplaySettings(replayStatus.config)
      // `'manual'` waits for startSessionReplay. A start that raced init is already wanted.
      if (replayMode === true || replayWanted) beginReplay()
    }
    return { ready: true }
  }

  const track = (name: string, props?: AnalyticsProps): void => {
    if (!isCustomEventName(name)) {
      console.warn(`[appwin] analytics event "${name}" dropped: invalid or reserved name.`)
      return
    }
    const clean = sanitizeProps(props)
    breadcrumbs.add('event', name)
    pipeline.enqueue(name, clean ? { props: clean } : {})
  }

  const setConsent = (state: ConsentState, purpose?: ConsentPurpose): void => {
    pipeline.setConsent(state, purpose)
    // Crash reports and replay are the `analytics` purpose: they follow its answer, read back from the store.
    const analytics = consent.state('analytics')
    crashes?.reporter.onConsentChange(analytics)
    replay?.onConsentChange(analytics)
  }

  const analytics: AppwinAnalytics = {
    initialize(options = {}) {
      started ??= start(options)
      return started
    },
    track,
    screen(name) {
      if (!started || !name) return
      recordScreen(name)
    },
    flush: () => pipeline.flush(),
    setConsent: (state) => setConsent(state),
    startSessionReplay() {
      replayWanted = true
      beginReplay()
    },
    stopSessionReplay() {
      replayWanted = false
      endReplay()
    },
    recordError(error, options) {
      crashes?.reporter.capture({
        kind: options?.fatal ? 'crash' : 'non_fatal',
        thrown: describeThrown(error, 'Error'),
      })
    },
  }

  return { analytics, track, setConsent }
}
