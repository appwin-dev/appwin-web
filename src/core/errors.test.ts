import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { AppwinError, codeForStatus } from './errors.ts'

describe('codeForStatus', () => {
  it('separates the two failures a studio must act on differently', () => {
    // 403 means "declare this domain in the dashboard"; 401 means "your App ID
    // is wrong". Collapsing them sends people to the wrong screen.
    assert.equal(codeForStatus(403), 'origin_not_allowed')
    assert.equal(codeForStatus(401), 'unauthorized')
  })

  it('maps the rest onto something actionable', () => {
    assert.equal(codeForStatus(404), 'not_found')
    assert.equal(codeForStatus(429), 'rate_limited')
    assert.equal(codeForStatus(500), 'server_error')
    assert.equal(codeForStatus(503), 'server_error')
    assert.equal(codeForStatus(422), 'bad_request')
  })
})

describe('AppwinError', () => {
  it('marks only the failures worth trying again', () => {
    assert.equal(new AppwinError('network', 'x').retryable, true)
    assert.equal(new AppwinError('server_error', 'x').retryable, true)
    assert.equal(new AppwinError('rate_limited', 'x').retryable, true)
    // Retrying these just repeats the same answer.
    assert.equal(new AppwinError('origin_not_allowed', 'x').retryable, false)
    assert.equal(new AppwinError('unauthorized', 'x').retryable, false)
    assert.equal(new AppwinError('bad_request', 'x').retryable, false)
  })
})
