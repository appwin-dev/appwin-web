import type { AppwinStorage } from '../core/storage.ts'
import type { AnalyticsConsent } from './types.ts'

const CONSENT_KEY = 'analytics:consent'

/** Lives in `localStorage`: a visitor answers the banner once for the whole site. */
export class ConsentStore {
  private readonly storage: AppwinStorage

  constructor(storage: AppwinStorage) {
    this.storage = storage
  }

  get value(): AnalyticsConsent {
    const stored = this.storage.get(CONSENT_KEY)
    return stored === 'unknown' || stored === 'denied' ? stored : 'granted'
  }

  set(consent: AnalyticsConsent): void {
    this.storage.set(CONSENT_KEY, consent)
  }
}
