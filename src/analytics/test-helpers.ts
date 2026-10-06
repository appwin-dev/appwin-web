import type { AppwinStorage } from '../core/storage.ts'

export function fakeStorage(): AppwinStorage & { map: Map<string, string> } {
  const map = new Map<string, string>()
  return {
    map,
    get: (key) => map.get(key) ?? null,
    set: (key, value) => void map.set(key, value),
    remove: (key) => void map.delete(key),
  }
}

export function fakeClock(start = Date.UTC(2026, 9, 2, 12)): { now: () => number; advance: (ms: number) => void } {
  let current = start
  return {
    now: () => current,
    advance: (ms) => void (current += ms),
  }
}
