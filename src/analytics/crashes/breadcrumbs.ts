import type { CrashBreadcrumb } from './types.ts'

export const MAX_BREADCRUMBS = 20
const MAX_NAME_LENGTH = 128

/** The last screens and events before a crash. Names only: props may carry PII. */
export class Breadcrumbs {
  private readonly items: CrashBreadcrumb[] = []
  private readonly now: () => number
  /** Kept apart from `items`: 20 events in a row must not evict the current screen. */
  private current: string | null = null

  constructor(now: () => number = Date.now) {
    this.now = now
  }

  add(type: CrashBreadcrumb['type'], name: string): void {
    if (!name) return
    const item: CrashBreadcrumb = {
      at: new Date(this.now()).toISOString(),
      type,
      name: name.slice(0, MAX_NAME_LENGTH),
    }
    if (type === 'screen') this.current = item.name
    this.items.push(item)
    if (this.items.length > MAX_BREADCRUMBS) this.items.shift()
  }

  /** The current screen, which a report also carries on its own. */
  get screen(): string | null {
    return this.current
  }

  snapshot(): CrashBreadcrumb[] {
    return this.items.map((item) => ({ ...item }))
  }
}
