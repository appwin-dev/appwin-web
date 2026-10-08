import { REPLAY_LIMITS } from './config.ts'

/** The few fields of an rrweb event read here; the rest is uploaded untouched. */
export interface RecordedEvent {
  type: number
  timestamp: number
  data?: unknown
}

export interface ReplayTouch {
  t: number
  x: number
  y: number
}

export interface ReplayScreen {
  t: number
  name: string
}

/** `ReplaySegmentMetaSchema` of the contracts, minus `sentAt` which is stamped per attempt. */
export interface SegmentMeta {
  sessionId: string
  seq: number
  kind: 'rrweb'
  runtime: 'web'
  startedAt: string
  endedAt: string
  screens: ReplayScreen[]
  touches: ReplayTouch[]
}

export interface Viewport {
  width: number
  height: number
}

// rrweb's `EventType.IncrementalSnapshot`, `IncrementalSource.MouseInteraction`, `MouseInteractions.Click`.
const INCREMENTAL_SNAPSHOT = 3
const MOUSE_INTERACTION = 2
const CLICK = 2

/** Matches the contract's bound on `t`, so a long segment cannot make the server reject it. */
const MAX_OFFSET_MS = 600_000

/**
 * The events of one ~10 s segment, with the clicks and page views the player
 * and the replay list read without decompressing anything.
 */
export class Segment {
  readonly startedAt: number
  readonly events: RecordedEvent[] = []
  readonly screens: ReplayScreen[] = []
  readonly touches: ReplayTouch[] = []

  constructor(startedAt: number) {
    this.startedAt = startedAt
  }

  get isEmpty(): boolean {
    return this.events.length === 0
  }

  /** Viewport at the time of the event: rrweb gives clicks in CSS pixels of the window. */
  add(event: RecordedEvent, viewport: Viewport): void {
    this.events.push(event)
    const click = clickPosition(event)
    if (!click || this.touches.length >= REPLAY_LIMITS.maxTouches) return
    if (viewport.width <= 0 || viewport.height <= 0) return
    this.touches.push({
      t: this.offset(event.timestamp),
      x: clamp01(click.x / viewport.width),
      y: clamp01(click.y / viewport.height),
    })
  }

  /** A repeat of the last screen is ignored: a new recording already opens on the current one. */
  addScreen(name: string, at: number): void {
    const clean = name.slice(0, 128)
    if (!clean || this.screens.length >= REPLAY_LIMITS.maxScreens) return
    if (this.screens[this.screens.length - 1]?.name === clean) return
    this.screens.push({ t: this.offset(at), name: clean })
  }

  meta(sessionId: string, seq: number, endedAt: number): SegmentMeta {
    return {
      sessionId,
      seq,
      kind: 'rrweb',
      runtime: 'web',
      startedAt: new Date(this.startedAt).toISOString(),
      endedAt: new Date(Math.max(endedAt, this.startedAt)).toISOString(),
      screens: this.screens,
      touches: this.touches,
    }
  }

  private offset(at: number): number {
    return Math.min(MAX_OFFSET_MS, Math.max(0, Math.round(at - this.startedAt)))
  }
}

function clickPosition(event: RecordedEvent): { x: number; y: number } | null {
  if (event.type !== INCREMENTAL_SNAPSHOT || !event.data || typeof event.data !== 'object') return null
  const data = event.data as { source?: unknown; type?: unknown; x?: unknown; y?: unknown }
  if (data.source !== MOUSE_INTERACTION || data.type !== CLICK) return null
  if (typeof data.x !== 'number' || typeof data.y !== 'number') return null
  return { x: data.x, y: data.y }
}

function clamp01(value: number): number {
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0
}

/** Gzipped JSON array of the events, the body the ingestion stores as is. */
export async function compressEvents(events: readonly RecordedEvent[]): Promise<Blob> {
  const stream = new Blob([JSON.stringify(events)]).stream().pipeThrough(new CompressionStream('gzip'))
  const blob = await new Response(stream).blob()
  return new Blob([blob], { type: 'application/gzip' })
}
