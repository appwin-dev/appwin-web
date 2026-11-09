import type { AppwinStorage } from '../core/storage.ts'
import { uuid7 } from './uuid7.ts'

const ID_KEY = 'analytics:session-id'
const STARTED_AT_KEY = 'analytics:session-started-at'
const LAST_ACTIVE_KEY = 'analytics:session-last-active-at'

/** Rewriting the activity mark on every event would hammer storage; 10 s is invisible next to 30 min. */
const ACTIVITY_WRITE_INTERVAL_MS = 10_000

export interface SessionEvent {
  name: 'session_start' | 'session_end'
  sessionId: string
  occurredAt: number
  durationMs?: number
}

export interface SessionTrackerOptions {
  timeoutMs: number
  maxAgeMs: number
  now?: () => number
}

/**
 * Analytics sessions, shared by every tab of the site: the state is read back
 * from `localStorage` on each call instead of cached, so two open tabs count as
 * one visit.
 *
 * Unlike the mobile SDKs, no `app_install` / `app_update`: a site has no
 * install, and counting first visits as one would skew the install tiles.
 */
export class SessionTracker {
  private lastActivityWrite = 0
  private readonly storage: AppwinStorage
  private readonly options: SessionTrackerOptions
  private readonly now: () => number

  constructor(storage: AppwinStorage, options: SessionTrackerOptions) {
    this.storage = storage
    this.options = options
    this.now = options.now ?? Date.now
  }

  get sessionId(): string | null {
    return this.storage.get(ID_KEY)
  }

  /**
   * Called before every event. Returns the lifecycle events to queue first and
   * guarantees a current session. A session that went stale while the page was
   * closed ends at its last activity, not now.
   */
  touch(): SessionEvent[] {
    const at = this.now()
    const sessionId = this.sessionId
    const startedAt = this.readNumber(STARTED_AT_KEY)
    const lastActiveAt = this.readNumber(LAST_ACTIVE_KEY)

    if (sessionId && startedAt !== null && lastActiveAt !== null) {
      const expired =
        at - lastActiveAt > this.options.timeoutMs || at - startedAt > this.options.maxAgeMs
      if (!expired) {
        this.recordActivity(at)
        return []
      }
      return [
        {
          name: 'session_end',
          sessionId,
          occurredAt: lastActiveAt,
          durationMs: Math.max(0, lastActiveAt - startedAt),
        },
        this.start(at),
      ]
    }
    return [this.start(at)]
  }

  /** The page was hidden: stamp the activity now, it is where a later `session_end` will land. */
  markInactive(): void {
    if (!this.sessionId) return
    this.lastActivityWrite = 0
    this.recordActivity(this.now())
  }

  reset(): void {
    this.storage.remove(ID_KEY)
    this.storage.remove(STARTED_AT_KEY)
    this.storage.remove(LAST_ACTIVE_KEY)
  }

  private start(at: number): SessionEvent {
    const sessionId = uuid7(at)
    this.storage.set(ID_KEY, sessionId)
    this.storage.set(STARTED_AT_KEY, String(at))
    this.lastActivityWrite = 0
    this.recordActivity(at)
    return { name: 'session_start', sessionId, occurredAt: at }
  }

  private recordActivity(at: number): void {
    if (at - this.lastActivityWrite < ACTIVITY_WRITE_INTERVAL_MS) return
    this.storage.set(LAST_ACTIVE_KEY, String(at))
    this.lastActivityWrite = at
  }

  private readNumber(key: string): number | null {
    const raw = this.storage.get(key)
    const value = raw === null ? NaN : Number(raw)
    return Number.isFinite(value) ? value : null
  }
}
