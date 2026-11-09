import type { AppwinStorage } from '../../core/storage.ts'
import { byteLength } from './report.ts'
import type { CrashReport } from './types.ts'

const QUEUE_KEY = 'analytics:crashes'
export const MAX_QUEUED_CRASHES = 20

/**
 * Reports not yet acknowledged, in `localStorage` so a crash that kills the
 * tab is sent on the next page load. Read back on every call instead of
 * cached: every tab of the site shares the key.
 */
export class CrashQueue {
  private readonly storage: AppwinStorage

  constructor(storage: AppwinStorage) {
    this.storage = storage
  }

  get size(): number {
    return this.load().length
  }

  /** Oldest reports go first when the queue is full. */
  push(report: CrashReport): void {
    const reports = this.load()
    reports.push(report)
    this.save(reports.slice(-MAX_QUEUED_CRASHES))
  }

  /** The oldest reports that fit in one request, always at least one. */
  nextBatch(maxBytes: number): CrashReport[] {
    const batch: CrashReport[] = []
    let bytes = 0
    for (const report of this.load()) {
      const size = byteLength(report)
      if (batch.length > 0 && bytes + size > maxBytes) break
      batch.push(report)
      bytes += size
    }
    return batch
  }

  remove(batch: CrashReport[]): void {
    const sent = new Set(batch.map((report) => report.crashId))
    const left = this.load().filter((report) => !sent.has(report.crashId))
    if (left.length === 0) this.clear()
    else this.save(left)
  }

  clear(): void {
    this.storage.remove(QUEUE_KEY)
  }

  private load(): CrashReport[] {
    try {
      const parsed: unknown = JSON.parse(this.storage.get(QUEUE_KEY) ?? '[]')
      return Array.isArray(parsed) ? (parsed as CrashReport[]) : []
    } catch {
      return []
    }
  }

  private save(reports: CrashReport[]): void {
    this.storage.set(QUEUE_KEY, JSON.stringify(reports))
  }
}
