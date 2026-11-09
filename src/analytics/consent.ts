import type { AppwinStorage } from '../core/storage.ts'
import type { ConsentPurpose, ConsentState } from './types.ts'

const LEGACY_KEY = 'analytics:consent'

export const CONSENT_PURPOSES: readonly ConsentPurpose[] = ['analytics', 'marketing', 'advertising']

/**
 * Lives in `localStorage`: a visitor answers the banner once for the whole
 * site. The storage is the single source of truth, every read goes through it
 * so no copy can drift from what `set` wrote.
 */
export class ConsentStore {
  private readonly storage: AppwinStorage

  constructor(storage: AppwinStorage) {
    this.storage = storage
    this.migrateLegacy()
  }

  state(purpose: ConsentPurpose): ConsentState {
    const stored = this.storage.get(keyOf(purpose))
    return stored === 'unknown' || stored === 'denied' ? stored : 'granted'
  }

  /** Without a purpose, sets the three at once. */
  set(state: ConsentState, purpose?: ConsentPurpose): void {
    for (const each of purpose ? [purpose] : CONSENT_PURPOSES) this.storage.set(keyOf(each), state)
  }

  /**
   * Before purposes, one answer covered everything. A visitor who refused stays
   * refused on the three, and an answer already given for a purpose wins.
   */
  private migrateLegacy(): void {
    const legacy = this.storage.get(LEGACY_KEY)
    if (legacy === null) return
    if (legacy === 'unknown' || legacy === 'denied' || legacy === 'granted') {
      for (const purpose of CONSENT_PURPOSES) {
        if (this.storage.get(keyOf(purpose)) === null) this.storage.set(keyOf(purpose), legacy)
      }
    }
    this.storage.remove(LEGACY_KEY)
  }

  get grantedPurposes(): ConsentPurpose[] {
    return CONSENT_PURPOSES.filter((purpose) => this.state(purpose) === 'granted')
  }

  get allDenied(): boolean {
    return CONSENT_PURPOSES.every((purpose) => this.state(purpose) === 'denied')
  }

  get anyUnknown(): boolean {
    return CONSENT_PURPOSES.some((purpose) => this.state(purpose) === 'unknown')
  }
}

function keyOf(purpose: ConsentPurpose): string {
  return `consent:${purpose}`
}
