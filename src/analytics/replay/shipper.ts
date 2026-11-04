import { REPLAY_LIMITS } from './config.ts'
import type { RecordingState } from './recording-state.ts'
import type { RecordedEvent, Segment } from './segment.ts'
import type { QueuedSegment } from './uploader.ts'

export interface ShipperDeps {
  state: Pick<RecordingState, 'hasBudget' | 'claimSegment'>
  compress: (events: readonly RecordedEvent[]) => Promise<Blob>
  push: (segment: QueuedSegment) => void
  /** Too large to send: the next segment must start from a full snapshot. */
  onOversized: (sessionId: string) => void
  /** The session's recording budget is spent. */
  onBudgetSpent: (sessionId: string) => void
}

/**
 * Compresses finished segments and hands them to the uploader, in the order
 * they were cut. Kept apart from the recorder so it runs without rrweb or a
 * DOM.
 */
export class SegmentShipper {
  private generation = 0
  private tail: Promise<void> = Promise.resolve()
  private readonly deps: ShipperDeps

  constructor(deps: ShipperDeps) {
    this.deps = deps
  }

  ship(segment: Segment, sessionId: string, endedAt: number): Promise<void> {
    const generation = this.generation
    const compressed = this.deps.compress(segment.events).catch(() => null)
    // Compression runs in parallel, the rest one segment at a time: `seq` is
    // claimed only once a segment is known to fit, so it must follow cut order.
    this.tail = this.tail
      .then(async () => {
        const blob = await compressed
        // Consent withdrawn or recorder stopped while compressing.
        if (!blob || generation !== this.generation) return
        if (blob.size > REPLAY_LIMITS.segmentMaxBytes) {
          this.deps.onOversized(sessionId)
          return
        }
        // A last segment cut after the budget ran out.
        if (!this.deps.state.hasBudget(sessionId)) return
        const { seq, budgetLeft } = this.deps.state.claimSegment(
          sessionId,
          endedAt - segment.startedAt,
        )
        this.deps.push({ meta: segment.meta(sessionId, seq, endedAt), blob })
        if (!budgetLeft) this.deps.onBudgetSpent(sessionId)
      })
      // A throwing callback must not stall every later segment behind it.
      .catch(() => {})
    return this.tail
  }

  /** Segments still compressing are never pushed. */
  discard(): void {
    this.generation += 1
  }
}
