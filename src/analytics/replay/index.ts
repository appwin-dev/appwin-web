import type { Session } from '../../core/session.ts'
import type { AppwinStorage } from '../../core/storage.ts'
import type { ConsentStore } from '../consent.ts'
import type { SessionTracker } from '../session-tracker.ts'
import type { AnalyticsConsent } from '../types.ts'
import { isSampled, REPLAY_LIMITS, type ReplaySettings } from './config.ts'
import type { Recorder } from './recorder.ts'

export interface ReplayDeps {
  session: Session
  storage: AppwinStorage
  consent: ConsentStore
  sessions: SessionTracker
  settings: ReplaySettings
  /** The page view recorded before replay was known to be on. */
  initialScreen: string | null
}

export interface SessionReplay {
  screen(name: string): void
  onConsentChange(consent: AnalyticsConsent): void
  stop(): void
}

/**
 * Session replay (ADR-0057), the part that ships in the main bundle: it only
 * decides whether this session is recorded, and loads the recorder, rrweb
 * with it, the first time one is.
 *
 * The analytics session can rotate under a page that stays open (timeout,
 * another tab), so the decision is taken again on a timer and on each page
 * view: a new session is a new recording, sampled on its own id.
 */
export function startReplay(deps: ReplayDeps): SessionReplay {
  const { consent, sessions, settings } = deps
  const noop: SessionReplay = { screen() {}, onConsentChange() {}, stop() {} }
  if (typeof document === 'undefined') return noop
  if (typeof CompressionStream === 'undefined') {
    console.warn('[appwin] session replay off: this browser has no CompressionStream.')
    return noop
  }

  let recorder: Recorder | null = null
  let loading = false
  let stopped = false
  let screen = deps.initialScreen

  const target = (): string | null => {
    if (stopped || consent.value !== 'granted') return null
    const sessionId = sessions.sessionId
    return sessionId && isSampled(sessionId, settings.sampleRate) ? sessionId : null
  }

  const sync = (): void => {
    if (recorder) {
      recorder.sync(target())
      return
    }
    if (loading || !target()) return
    loading = true
    import('./recorder.ts')
      .then(({ createRecorder }) => {
        if (stopped) return
        recorder = createRecorder({
          session: deps.session,
          storage: deps.storage,
          settings,
          currentScreen: () => screen,
          onDisabled: () => {
            stopped = true
            clearInterval(timer)
          },
        })
        recorder.sync(target())
      })
      .catch((err: unknown) => {
        stopped = true
        clearInterval(timer)
        console.warn(`[appwin] session replay could not load: ${err instanceof Error ? err.message : String(err)}`)
      })
  }

  const timer = setInterval(sync, REPLAY_LIMITS.segmentMs)
  sync()

  return {
    screen(name) {
      screen = name
      sync()
      recorder?.screen(name)
    },
    onConsentChange(value) {
      if (value !== 'granted') recorder?.discard()
      sync()
    },
    stop() {
      stopped = true
      clearInterval(timer)
      recorder?.stop()
    },
  }
}
