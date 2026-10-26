import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'

import { createStorage } from './storage.ts'

/**
 * `localStorage` is not optional-but-usually-there. Safari in private mode
 * throws on write, embedded webviews disable it, visitors block site data.
 * Each case below is a real browser, and none of them may crash the widget.
 */

const realLocalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')

function stubLocalStorage(value: unknown): void {
  Object.defineProperty(globalThis, 'localStorage', { value, configurable: true, writable: true })
}

afterEach(() => {
  if (realLocalStorage) Object.defineProperty(globalThis, 'localStorage', realLocalStorage)
  else delete (globalThis as { localStorage?: unknown }).localStorage
})

function workingLocalStorage() {
  const map = new Map<string, string>()
  return {
    map,
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
    removeItem: (key: string) => void map.delete(key),
  }
}

describe('createStorage', () => {
  it('namespaces per app so two apps never read each other', () => {
    const local = workingLocalStorage()
    stubLocalStorage(local)

    createStorage('app-a').set('k', 'a')
    createStorage('app-b').set('k', 'b')

    assert.equal(local.map.get('appwin:app-a:k'), 'a')
    assert.equal(local.map.get('appwin:app-b:k'), 'b')
  })

  it('falls back to memory when writes are blocked, instead of throwing', () => {
    stubLocalStorage({
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
      removeItem: () => {},
    })

    const storage = createStorage('app-a')
    // Forgetting on reload is the accepted cost; crashing on load is not.
    assert.doesNotThrow(() => storage.set('k', 'v'))
    assert.equal(storage.get('k'), 'v')
  })

  it('survives storage being absent entirely', () => {
    stubLocalStorage(undefined)

    const storage = createStorage('app-a')
    assert.doesNotThrow(() => storage.set('k', 'v'))
    assert.equal(storage.get('k'), 'v')
    storage.remove('k')
    assert.equal(storage.get('k'), null)
  })

  it('probes with a real write, since only writing throws in private mode', () => {
    let probed = false
    stubLocalStorage({
      getItem: () => null,
      setItem: (key: string) => {
        if (key === '__appwin_probe__') probed = true
      },
      removeItem: () => {},
    })

    createStorage('app-a')
    assert.equal(probed, true)
  })
})
