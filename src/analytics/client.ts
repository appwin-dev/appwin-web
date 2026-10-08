import { fetchProductStatuses, type ProductStatus } from '../core/availability.ts'
import { AppwinError } from '../core/errors.ts'
import type { Session } from '../core/session.ts'
import type { AppwinStorage } from '../core/storage.ts'
import { ConsentStore } from './consent.ts'
import { Breadcrumbs } from './crashes/breadcrumbs.ts'
import { startCrashReporting, type CrashReporting } from './crashes/index.ts'
import { describeThrown } from './crashes/report.ts'
import type { RecordErrorOptions } from './crashes/types.ts'
import { EventQueue } from './event-queue.ts'
import { watchLifecycle } from './lifecycle.ts'
import { watchPageViews } from './page-views.ts'
import { PIPELINE_CONFIG, Pipeline } from './pipeline.ts'
import { parseReplaySettings } from './replay/config.ts'
import { startReplay, type SessionReplay } from './replay/index.ts'
import { createSender } from './sender.ts'
import { SessionTracker } from './session-tracker.ts'
import type {
  AnalyticsConsent,
  AnalyticsInitOptions,
  AnalyticsInitResult,
  AnalyticsProps,
} from './types.ts'
import { isCustomEventName, sanitizeProps, sanitizeScreen } from './validation.ts'

/**
 * Appwin Analytics: behavioral events for the dashboards, funnels and
 * experiments of the Appwin studio.
 *
 * ```ts
 * await appwin.analytics.initialize()
 * appwin.analytics.track('purchase', { plan: 'pro', seats: 3 })
 * ```
 */
export interface AppwinAnalytics {
  /**
   * Starts capture, then checks the plan and the dashboard toggle before
   * anything is uploaded. Nothing is recorded before this call. Calling it
   * again returns the first result.
   */
  initialize(options?: AnalyticsInitOptions): Promise<AnalyticsInitResult>
  /**
   * Queues a custom event. Never throws. `name` must match
   * `^[a-z][a-z0-9_]{0,63}$` and not be a reserved name (`session_start`,
   * `screen_view`...). Props are capped at 20 scalar values, strings at 256
   * characters.
   */
  track(name: string, props?: AnalyticsProps): void
  /** Records a `screen_view`. Only needed with `pageViews: false`, or for views that are not pages. */
  screen(name: string): void
  /** Uploads the queue now. Rarely needed: it already flushes on volume, on a timer and when the page is hidden. */
  flush(): Promise<void>
  /** Can be called before `initialize()`, typically from a consent banner. See {@link AnalyticsConsent}. */
  setConsent(consent: AnalyticsConsent): void
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
  /** Private to this tab. */
  tabStorage: AppwinStorage
  sdkVersion: string
}

export function createAnalytics({ session, storage, tabStorage, sdkVersion }: AnalyticsDeps): AppwinAnalytics {
  const sessions = new SessionTracker(storage, {
    timeoutMs: PIPELINE_CONFIG.sessionTimeoutMs,
    maxAgeMs: PIPELINE_CONFIG.maxSessionAgeMs,
  })
  const consent = new ConsentStore(storage)
  const pipeline = new Pipeline({
    queue: new EventQueue(tabStorage, PIPELINE_CONFIG.maxQueueEvents),
    sessions,
    consent,
    send: createSender(session),
  })
  const breadcrumbs = new Breadcrumbs()

  let started: Promise<AnalyticsInitResult> | null = null
  let crashes: CrashReporting | null = null
  let replay: SessionReplay | null = null

  const recordScreen = (name: string) => {
    const screen = sanitizeScreen(name)
    breadcrumbs.add('screen', screen)
    pipeline.enqueue('screen_view', { screen })
    replay?.screen(screen)
  }

  async function start(options: AnalyticsInitOptions): Promise<AnalyticsInitResult> {
    const stopLifecycle = watchLifecycle(pipeline, sessions)
    const stopPageViews =
      options.pageViews === false
        ? () => {}
        : watchPageViews(recordScreen)
    if (options.crashReporting !== false) {
      crashes = startCrashReporting({ session, storage, consent, sessions, breadcrumbs, sdkVersion })
    }

    const shutdown = (result: AnalyticsInitResult, detail: string): AnalyticsInitResult => {
      stopLifecycle()
      stopPageViews()
      pipeline.shutdown()
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

    pipeline.enableUploads()
    crashes?.reporter.enableUploads()
    if (options.sessionReplay !== false && replayStatus?.enabled) {
      replay = startReplay({
        session,
        storage,
        consent,
        sessions,
        settings: parseReplaySettings(replayStatus.config),
        initialScreen: breadcrumbs.screen,
      })
    }
    return { ready: true }
  }

  return {
    initialize(options = {}) {
      started ??= start(options)
      return started
    },
    track(name, props) {
      if (!started) return
      if (!isCustomEventName(name)) {
        console.warn(`[appwin] analytics event "${name}" dropped: invalid or reserved name.`)
        return
      }
      const clean = sanitizeProps(props)
      breadcrumbs.add('event', name)
      pipeline.enqueue(name, clean ? { props: clean } : {})
    },
    screen(name) {
      if (!started || !name) return
      recordScreen(name)
    },
    flush: () => pipeline.flush(),
    setConsent(value) {
      pipeline.setConsent(value)
      crashes?.reporter.onConsentChange(value)
      replay?.onConsentChange(value)
    },
    recordError(error, options) {
      crashes?.reporter.capture({
        kind: options?.fatal ? 'crash' : 'non_fatal',
        thrown: describeThrown(error, 'Error'),
      })
    },
  }
}
