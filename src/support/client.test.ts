import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'

import { Session } from '../core/session.ts'
import type { AppwinStorage } from '../core/storage.ts'
import { SupportClient } from './client.ts'

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

describe('SupportClient.pause', () => {
  it('is the pause of support, with empty strings for a text the server left out', async () => {
    const storage = fakeStorage()
    stubFetch(async () => json({ products: { support: { enabled: false, reason: 'plan', paused: { since: '2026-11-15T10:00:00.000Z' } } } }))
    const client = new SupportClient(makeSession(storage), storage)
    assert.deepEqual(await client.pause(), { since: '2026-11-15T10:00:00.000Z', title: '', message: '' })
  })

  it('is null when Grow is not paused, and null when the server does not answer', async () => {
    const storage = fakeStorage()
    stubFetch(async () => json({ products: { support: { enabled: false, reason: 'plan' } } }))
    assert.equal(await new SupportClient(makeSession(storage), storage).pause(), null)
    stubFetch(async () => json({ message: 'down' }, 503))
    assert.equal(await new SupportClient(makeSession(fakeStorage()), fakeStorage()).pause(), null)
  })

  it('is null, and does not throw, when the server refuses this page for good', async () => {
    const storage = fakeStorage()
    stubFetch(async () => json({ message: 'Origin not allowed for this appId' }, 403))
    assert.equal(await new SupportClient(makeSession(storage), storage).pause(), null)
  })
})
