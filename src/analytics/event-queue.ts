import type { AppwinStorage } from '../core/storage.ts'
import type { WireEvent } from './types.ts'

const QUEUE_KEY = 'analytics:queue'

export interface BatchLimits {
  maxEvents: number
  maxBytes: number
}

/**
 * Pending events of this tab, persisted in `sessionStorage` so a reload or a
 * full-page navigation keeps them. One queue per tab means no two tabs ever
 * write the same key.
 */
export class EventQueue {
  private events: WireEvent[]
  private readonly storage: AppwinStorage
  private readonly maxEvents: number

  constructor(storage: AppwinStorage, maxEvents: number) {
    this.storage = storage
    this.maxEvents = maxEvents
    this.events = load(storage)
  }

  get size(): number {
    return this.events.length
  }

  /** Oldest events go first when the queue is full. */
  push(event: WireEvent): void {
    this.events.push(event)
    if (this.events.length > this.maxEvents) {
      this.events.splice(0, this.events.length - this.maxEvents)
    }
    this.save()
  }

  /** The oldest events that fit in one request. Always at least one, so an oversized event cannot jam the queue. */
  nextBatch(limits: BatchLimits): WireEvent[] {
    const batch: WireEvent[] = []
    let bytes = 0
    for (const event of this.events) {
      const size = byteLength(JSON.stringify(event))
      if (batch.length > 0 && (batch.length >= limits.maxEvents || bytes + size > limits.maxBytes)) break
      batch.push(event)
      bytes += size
    }
    return batch
  }

  /** By id rather than by position: the queue may have been cleared or grown while the batch was in flight. */
  remove(batch: WireEvent[]): void {
    const sent = new Set(batch.map((event) => event.eventId))
    this.events = this.events.filter((event) => !sent.has(event.eventId))
    this.save()
  }

  clear(): void {
    this.events = []
    this.storage.remove(QUEUE_KEY)
  }

  private save(): void {
    this.storage.set(QUEUE_KEY, JSON.stringify(this.events))
  }
}

function load(storage: AppwinStorage): WireEvent[] {
  try {
    const parsed: unknown = JSON.parse(storage.get(QUEUE_KEY) ?? '[]')
    return Array.isArray(parsed) ? (parsed as WireEvent[]) : []
  } catch {
    return []
  }
}

function byteLength(text: string): number {
  return new TextEncoder().encode(text).length
}
