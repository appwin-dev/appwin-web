import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'

import { AppwinError } from './errors.ts'
import { request } from './http.ts'

const realFetch = globalThis.fetch

function respondWith(body: unknown, status: number): void {
  globalThis.fetch = async () =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

async function failure(): Promise<AppwinError> {
  try {
    await request('https://api.example.test', { method: 'GET', path: '/x' })
  } catch (err) {
    assert.ok(err instanceof AppwinError)
    return err
  }
  assert.fail('request should have thrown')
}

describe('request', () => {
  afterEach(() => {
    globalThis.fetch = realFetch
  })

  it('tells a plan refusal apart from an undeclared origin, both being 403', async () => {
    respondWith({ code: 'PLAN_UPGRADE_REQUIRED', product: 'support' }, 403)
    const planError = await failure()
    assert.equal(planError.code, 'plan_upgrade_required')
    assert.equal(planError.retryable, false)
    assert.match(planError.message, /support/)

    respondWith({ message: 'Origin not allowed' }, 403)
    assert.equal((await failure()).code, 'origin_not_allowed')
  })

  it('keeps the server message for other failures', async () => {
    respondWith({ message: 'Bad payload' }, 422)
    const err = await failure()
    assert.equal(err.code, 'bad_request')
    assert.equal(err.message, 'Bad payload')
  })
})
