import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'

import { AppwinError } from './errors.ts'
import { Session } from './session.ts'
import type { AppwinStorage } from './storage.ts'

/**
 * The session is where a browser differs from a phone: tabs stay open for days,
 * several of them share one storage, and a token can be revoked from the
 * dashboard under a page that is still running. Everything asserted here is a
 * failure that would otherwise show up as a messenger that silently stops.
 */

function fakeStorage(seed: Record<string, string> = {}): AppwinStorage {
  const map = new Map(Object.entries(seed))
  return {
    get: (key) => map.get(key) ?? null,
    set: (key, value) => void map.set(key, value),
    remove: (key) => void map.delete(key),
  }
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const TOKEN_RESPONSE = { token: 't1', customerSessionId: 's1', expiresAt: null }

interface FetchCall {
  url: string
  init: RequestInit
}

/** Queues responses and records what was sent, without a mocking library. */
function stubFetch(responses: Array<Response | Error>): FetchCall[] {
  const calls: FetchCall[] = []
  let index = 0
  globalThis.fetch = ((url: string, init: RequestInit) => {
    calls.push({ url, init })
    const next = responses[Math.min(index, responses.length - 1)]!
    index += 1
    if (next instanceof Error) return Promise.reject(next)
    // Each call needs its own body stream.
    return Promise.resolve(next.clone())
  }) as unknown as typeof fetch
  return calls
}

const realFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = realFetch
})

function makeSession(storage: AppwinStorage = fakeStorage()): Session {
  return new Session({
    appId: 'app-1',
    baseUrl: 'https://api.test',
    storage,
    sdkVersion: '0.0.0-test',
  })
}

describe('Session', () => {
  it('opens a session once and reuses the token', async () => {
    const calls = stubFetch([jsonResponse(TOKEN_RESPONSE)])
    const session = makeSession()

    assert.equal(await session.authenticate(), 't1')
    assert.equal(await session.authenticate(), 't1')
    assert.equal(calls.length, 1)
  })

  it('persists the token so a reload does not open a second session', async () => {
    const storage = fakeStorage()
    stubFetch([jsonResponse(TOKEN_RESPONSE)])
    await makeSession(storage).authenticate()

    const calls = stubFetch([jsonResponse(TOKEN_RESPONSE)])
    // A fresh instance is what a page reload produces.
    assert.equal(await makeSession(storage).authenticate(), 't1')
    assert.equal(calls.length, 0)
  })

  it('keeps the same device id across reloads', () => {
    const storage = fakeStorage()
    const first = makeSession(storage).deviceId
    assert.equal(makeSession(storage).deviceId, first)
    assert.ok(first.length > 0)
  })

  it('collapses concurrent callers onto one init request', async () => {
    const calls = stubFetch([jsonResponse(TOKEN_RESPONSE)])
    const session = makeSession()

    // Three callers booting at once must not open three sessions: each init
    // rotates the token, so two of them would end up holding a dead one.
    const tokens = await Promise.all([
      session.authenticate(),
      session.authenticate(),
      session.authenticate(),
    ])

    assert.deepEqual(tokens, ['t1', 't1', 't1'])
    assert.equal(calls.length, 1)
  })

  it('re-opens the session once when the token was revoked', async () => {
    const calls = stubFetch([
      jsonResponse({ message: 'Invalid or revoked token' }, 401),
      jsonResponse({ token: 'fresh', customerSessionId: 's', expiresAt: null }),
      jsonResponse({ ok: true }),
    ])
    const session = makeSession(fakeStorage({ 'session-token': 'stale' }))

    assert.deepEqual(await session.fetch({ method: 'GET', path: '/x' }), { ok: true })

    const headers = calls[2]?.init.headers as Record<string, string>
    assert.equal(headers.Authorization, 'Bearer fresh')
  })

  it('does not retry a refused origin: looping would only bury the message', async () => {
    const calls = stubFetch([jsonResponse({ message: 'Origin not allowed' }, 403)])
    const session = makeSession(fakeStorage({ 'session-token': 't1' }))

    await assert.rejects(
      () => session.fetch({ method: 'GET', path: '/x' }),
      (err: AppwinError) => err.code === 'origin_not_allowed',
    )
    assert.equal(calls.length, 1)
  })

  it('rotates the session when the identity changes', async () => {
    const calls = stubFetch([
      jsonResponse({ token: 't2', customerSessionId: 's', expiresAt: null }),
    ])
    const session = makeSession(fakeStorage({ 'session-token': 't1' }))

    await session.identify('user-42')

    assert.equal(calls.length, 1)
    const body = JSON.parse(calls[0]?.init.body as string) as { externalId?: string }
    assert.equal(body.externalId, 'user-42')
    assert.equal(await session.authenticate(), 't2')
  })

  it('does not rotate when identify repeats the same user', async () => {
    stubFetch([jsonResponse(TOKEN_RESPONSE)])
    const storage = fakeStorage()
    const session = makeSession(storage)
    await session.identify('user-42')

    const calls = stubFetch([jsonResponse(TOKEN_RESPONSE)])
    // A host app calls identify on every page render; that has to be free.
    await session.identify('user-42')
    assert.equal(calls.length, 0)
  })

  it('forgets everything on reset, including the device id', async () => {
    const storage = fakeStorage()
    const session = makeSession(storage)
    const before = session.deviceId
    stubFetch([jsonResponse(TOKEN_RESPONSE)])
    await session.identify('user-42')

    session.reset()

    assert.equal(storage.get('session-token'), null)
    assert.equal(storage.get('external-id'), null)
    // The next person on a shared machine must not inherit the thread.
    assert.notEqual(makeSession(storage).deviceId, before)
    // Nor through the same instance: the widget keeps its Session across a
    // reset, so the id has to change in memory, not only in storage.
    assert.notEqual(session.deviceId, before)
  })

  it('opens the next session on the new device id after reset', async () => {
    const storage = fakeStorage()
    const session = makeSession(storage)
    const before = session.deviceId
    stubFetch([jsonResponse(TOKEN_RESPONSE)])
    await session.authenticate()

    session.reset()
    const calls = stubFetch([jsonResponse(TOKEN_RESPONSE)])
    await session.authenticate()

    const body = JSON.parse(String(calls[0]?.init?.body)) as { deviceId: string }
    assert.notEqual(body.deviceId, before)
    assert.equal(body.deviceId, session.deviceId)
  })

  it('sends the App ID and the browser platform when opening a session', async () => {
    const calls = stubFetch([jsonResponse(TOKEN_RESPONSE)])
    await makeSession().authenticate()

    const { url, init } = calls[0]!
    assert.equal(url, 'https://api.test/api/sdk/v1/auth/init')
    assert.equal((init.headers as Record<string, string>)['X-Appwin-App-Id'], 'app-1')
    const body = JSON.parse(init.body as string) as { platform: string; sdkVersion: string }
    assert.equal(body.platform, 'web')
    assert.equal(body.sdkVersion, '0.0.0-test')
  })

  it('never carries the studio site cookies to our API', async () => {
    const calls = stubFetch([jsonResponse(TOKEN_RESPONSE)])
    await makeSession().authenticate()
    assert.equal(calls[0]?.init.credentials, 'omit')
  })

  it('reports an unreachable API as a network error rather than throwing raw', async () => {
    stubFetch([new TypeError('Failed to fetch')])
    await assert.rejects(
      () => makeSession().authenticate(),
      (err: AppwinError) => err instanceof AppwinError && err.code === 'network',
    )
  })
})
