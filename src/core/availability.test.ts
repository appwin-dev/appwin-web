import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'

import { fetchProductStatus, fetchProductStatuses } from './availability.ts'
import { AppwinError } from './errors.ts'
import { Session } from './session.ts'
import type { AppwinStorage } from './storage.ts'

function fakeStorage(): AppwinStorage {
  const map = new Map<string, string>()
  return {
    get: (key) => map.get(key) ?? null,
    set: (key, value) => void map.set(key, value),
    remove: (key) => void map.delete(key),
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

const realFetch = globalThis.fetch
afterEach(() => {
  globalThis.fetch = realFetch
})

function stubFetch(answer: () => Promise<Response>): void {
  globalThis.fetch = (() => answer()) as unknown as typeof fetch
}

function makeSession(storage: AppwinStorage): Session {
  storage.set('session-token', 'tok')
  return new Session({ appId: 'app', baseUrl: 'http://api.test', storage, sdkVersion: '0' })
}

describe('fetchProductStatus', () => {
  it('reads the product and caches it', async () => {
    const storage = fakeStorage()
    stubFetch(async () => json({ products: { analytics: { enabled: true } } }))
    assert.deepEqual(await fetchProductStatus(makeSession(storage), storage, 'analytics'), { enabled: true })

    stubFetch(() => Promise.reject(new TypeError('offline')))
    assert.deepEqual(await fetchProductStatus(makeSession(storage), storage, 'analytics'), { enabled: true })
  })

  it('reads several products, with their config, from one request', async () => {
    const storage = fakeStorage()
    let calls = 0
    const config = { sampleRate: 0.5, maskAllText: true, maskAllImages: false }
    stubFetch(async () => {
      calls += 1
      return json({ products: { analytics: { enabled: true }, replay: { enabled: true, config } } })
    })
    assert.deepEqual(await fetchProductStatuses(makeSession(storage), storage, ['analytics', 'replay']), {
      analytics: { enabled: true },
      replay: { enabled: true, config },
    })
    assert.equal(calls, 1)

    stubFetch(() => Promise.reject(new TypeError('offline')))
    const cached = await fetchProductStatuses(makeSession(storage), storage, ['replay', 'support'])
    assert.deepEqual(cached, { replay: { enabled: true, config }, support: null })
  })

  it('treats an absent product as disabled', async () => {
    const storage = fakeStorage()
    stubFetch(async () => json({ products: {} }))
    assert.deepEqual(await fetchProductStatus(makeSession(storage), storage, 'analytics'), {
      enabled: false,
      reason: 'disabled',
    })
  })

  it('returns null when unreachable with nothing cached', async () => {
    const storage = fakeStorage()
    stubFetch(() => Promise.reject(new TypeError('offline')))
    assert.equal(await fetchProductStatus(makeSession(storage), storage, 'analytics'), null)
  })

  it('throws on a refusal instead of hiding it behind the cache', async () => {
    const storage = fakeStorage()
    stubFetch(async () => json({ message: 'Origin not allowed for this appId' }, 403))
    await assert.rejects(
      fetchProductStatus(makeSession(storage), storage, 'analytics'),
      (err: unknown) =>
        err instanceof AppwinError && err.code === 'origin_not_allowed' && err.message.includes('Web domains'),
    )
  })
})
