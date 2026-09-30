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
function localStorageAvailable(): boolean {
  try {
    const probe = '__appwin_probe__'
    globalThis.localStorage.setItem(probe, '1')
    globalThis.localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}

export function createStorage(appId: string): AppwinStorage {
  if (!localStorageAvailable()) return memoryStorage()

  // Even past the probe, every call stays guarded: quota can be reached later,
  // and a visitor can revoke site data mid-session.
  const fallback = memoryStorage()
  return {
    get(key) {
      try {
        return globalThis.localStorage.getItem(scopedKey(appId, key))
      } catch {
        return fallback.get(key)
      }
    },
    set(key, value) {
      try {
        globalThis.localStorage.setItem(scopedKey(appId, key), value)
      } catch {
        fallback.set(key, value)
      }
    },
    remove(key) {
      try {
        globalThis.localStorage.removeItem(scopedKey(appId, key))
      } catch {
        fallback.remove(key)
      }
    },
  }
}
