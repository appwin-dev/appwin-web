import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { SessionTracker } from './session-tracker.ts'
import { fakeClock, fakeStorage } from './test-helpers.ts'

const MINUTE = 60_000

function makeTracker(storage = fakeStorage(), clock = fakeClock()) {
  const tracker = new SessionTracker(storage, {
    timeoutMs: 30 * MINUTE,
    maxAgeMs: 24 * 60 * MINUTE,
    now: clock.now,
  })
  return { tracker, storage, clock }
}

describe('SessionTracker', () => {
  it('opens a session on the first event, then stays quiet', () => {
    const { tracker, clock } = makeTracker()
    const [start] = tracker.touch()
    assert.equal(start?.name, 'session_start')
    assert.equal(tracker.sessionId, start?.sessionId)

    clock.advance(5 * MINUTE)
    assert.deepEqual(tracker.touch(), [])
  })

  it('ends a stale session at its last activity, not now', () => {
    const { tracker, clock } = makeTracker()
    const [start] = tracker.touch()
    const startedAt = clock.now()

    clock.advance(31 * MINUTE)
    const [end, next] = tracker.touch()
    assert.equal(end?.name, 'session_end')
    assert.equal(end?.sessionId, start?.sessionId)
    assert.equal(end?.occurredAt, startedAt)
    assert.equal(next?.name, 'session_start')
    assert.notEqual(next?.sessionId, start?.sessionId)
  })

  it('counts the hidden instant as activity', () => {
    const { tracker, clock } = makeTracker()
    tracker.touch()
    clock.advance(20 * MINUTE)
    tracker.markInactive()
    clock.advance(20 * MINUTE)
    assert.deepEqual(tracker.touch(), [])
  })

  it('shares the session with another tab through storage', () => {
    const storage = fakeStorage()
    const clock = fakeClock()
    const tabA = makeTracker(storage, clock).tracker
    const tabB = makeTracker(storage, clock).tracker

    const [start] = tabA.touch()
    assert.deepEqual(tabB.touch(), [])
    assert.equal(tabB.sessionId, start?.sessionId)
  })

  it('forgets the session on reset', () => {
    const { tracker } = makeTracker()
    tracker.touch()
    tracker.reset()
    assert.equal(tracker.sessionId, null)
  })
})
