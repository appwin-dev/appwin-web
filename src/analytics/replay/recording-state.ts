import type { AppwinStorage } from '../../core/storage.ts'
import { REPLAY_LIMITS } from './config.ts'

const STATE_KEY = 'replay:state'

interface StoredState {
  sessionId: string
  nextSeq: number
  recordedMs: number
}

/**
 * Where a session's recording stands, in `localStorage` like the session
 * itself: a reload or a second tab continues the same numbering and the same
 * one-hour budget instead of starting over at `seq` 0, which the server would
 * read as a duplicate of the first segment.
 */
export class RecordingState {
  private readonly storage: AppwinStorage

  constructor(storage: AppwinStorage) {
    this.storage = storage
  }

  hasBudget(sessionId: string): boolean {
    return this.read(sessionId).recordedMs < REPLAY_LIMITS.maxSessionMs
  }

  /** Reserves the next `seq` and charges the segment's duration to the session. */
  claimSegment(sessionId: string, durationMs: number): { seq: number; budgetLeft: boolean } {
    const state = this.read(sessionId)
    const seq = state.nextSeq
    state.nextSeq += 1
    state.recordedMs += Math.max(0, durationMs)
    this.storage.set(STATE_KEY, JSON.stringify(state))
    return { seq, budgetLeft: state.recordedMs < REPLAY_LIMITS.maxSessionMs }
  }

  /** The stored state when it is this session's, a fresh one otherwise. */
  private read(sessionId: string): StoredState {
    try {
      const parsed = JSON.parse(this.storage.get(STATE_KEY) ?? 'null') as Partial<StoredState> | null
      if (
        parsed?.sessionId === sessionId &&
        Number.isInteger(parsed.nextSeq) &&
        typeof parsed.recordedMs === 'number'
      ) {
        return parsed as StoredState
      }
    } catch {
      /* a corrupted state restarts the numbering, as a new session would */
    }
    return { sessionId, nextSeq: 0, recordedMs: 0 }
  }
}
