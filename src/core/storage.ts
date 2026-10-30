/**
 * Small persistent store, scoped to one App ID.
 *
 * Everything here is wrapped in try/catch and falls back to memory, because
 * `localStorage` is not optional-but-usually-there: Safari in private mode
 * throws on write, embedded webviews disable it outright, and a visitor can
 * block site data. A support widget that throws on load because it could not
 * remember a device id would be worse than one that forgets.
 *
 * The cost of the fallback is honest and bounded: the visitor is anonymous
 * again on the next page load, exactly as if they had cleared their data.
 */
export interface AppwinStorage {
  get(key: string): string | null
  set(key: string, value: string): void
  remove(key: string): void
}

/** Namespaced so two apps on the same domain never read each other's session. */
function scopedKey(appId: string, key: string): string {
  return `appwin:${appId}:${key}`
}

function memoryStorage(): AppwinStorage {
  const map = new Map<string, string>()
  return {
    get: (key) => map.get(key) ?? null,
    set: (key, value) => void map.set(key, value),
    remove: (key) => void map.delete(key),
  }
}

/**
 * Probes `localStorage` with a real write: merely reading `window.localStorage`
 * succeeds in private mode, and only the write throws.
 */
function areaAvailable(area: StorageArea): boolean {
  try {
    const probe = '__appwin_probe__'
    globalThis[area].setItem(probe, '1')
    globalThis[area].removeItem(probe)
    return true
  } catch {
    return false
  }
}

/** `sessionStorage` holds what belongs to one tab, such as its analytics queue. */
export type StorageArea = 'localStorage' | 'sessionStorage'

export function createStorage(appId: string, area: StorageArea = 'localStorage'): AppwinStorage {
  if (!areaAvailable(area)) return memoryStorage()

  // Even past the probe, every call stays guarded: quota can be reached later,
  // and a visitor can revoke site data mid-session.
  const fallback = memoryStorage()
  return {
    get(key) {
      try {
        return globalThis[area].getItem(scopedKey(appId, key))
      } catch {
        return fallback.get(key)
      }
    },
    set(key, value) {
      try {
        globalThis[area].setItem(scopedKey(appId, key), value)
      } catch {
        fallback.set(key, value)
      }
    },
    remove(key) {
      try {
        globalThis[area].removeItem(scopedKey(appId, key))
      } catch {
        fallback.remove(key)
      }
    },
  }
}

/**
 * What one visit needs to stay one visit across the sites of a domain: the device, the current
 * session, where its replay stands, and the consent answers. The session token and the user's
 * identity stay with each site, which opens its own session for the same device.
 */
const SHARED_KEYS = new Set([
  'device-id',
  'analytics:session-id',
  'analytics:session-started-at',
  'analytics:session-last-active-at',
  'replay:state',
  'analytics:consent',
  'consent:analytics',
  'consent:marketing',
  'consent:advertising',
])

/** A year, as the device id lives: refreshed at each write. */
const COOKIE_MAX_AGE_S = 365 * 24 * 60 * 60

function cookieName(appId: string, key: string): string {
  return `appwin_${appId}_${key.replace(/[^A-Za-z0-9_-]/g, '_')}`
}

function readCookie(name: string): string | null {
  try {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
    return match ? decodeURIComponent(match[1]!) : null
  } catch {
    return null
  }
}

function writeCookie(name: string, value: string | null, domain: string): void {
  try {
    const secure = globalThis.location?.protocol === 'https:' ? '; Secure' : ''
    document.cookie =
      value === null
        ? `${name}=; Max-Age=0; Path=/; Domain=${domain}; SameSite=Lax${secure}`
        : `${name}=${encodeURIComponent(value)}; Max-Age=${COOKIE_MAX_AGE_S}; Path=/; Domain=${domain}; SameSite=Lax${secure}`
  } catch {
    /* no cookies: each site keeps its own visit, as without the option */
  }
}

/**
 * The store, with what makes a visit (cf. `SHARED_KEYS`) also kept in first-party cookies on
 * `domain` (`.example.com`), so the sites under it continue one device and one session: a
 * visitor who lands on the marketing site, signs up on `account.` and reaches `app.` is one
 * session, with one replay. The cookie wins over the site's own copy: the first site visited
 * names the device. `localStorage` stays the source for everything else.
 */
export function shareAcrossSubdomains(
  storage: AppwinStorage,
  appId: string,
  domain: string,
): AppwinStorage {
  if (typeof document === 'undefined') return storage
  return {
    get(key) {
      if (!SHARED_KEYS.has(key)) return storage.get(key)
      const shared = readCookie(cookieName(appId, key))
      if (shared !== null) {
        // Copied to the site's own store too: another copy of the SDK on the page without the
        // option (the support widget's script tag) reads that one, and must see the same device.
        if (storage.get(key) !== shared) storage.set(key, shared)
        return shared
      }
      // A site that ran before the option: its own value becomes the shared one.
      const local = storage.get(key)
      if (local !== null) writeCookie(cookieName(appId, key), local, domain)
      return local
    },
    set(key, value) {
      storage.set(key, value)
      if (SHARED_KEYS.has(key)) writeCookie(cookieName(appId, key), value, domain)
    },
    remove(key) {
      storage.remove(key)
      if (SHARED_KEYS.has(key)) writeCookie(cookieName(appId, key), null, domain)
    },
  }
}
