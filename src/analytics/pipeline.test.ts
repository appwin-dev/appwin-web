import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { ConsentStore } from './consent.ts'
import { EventQueue } from './event-queue.ts'
import { backoffDelay, Pipeline, PIPELINE_CONFIG } from './pipeline.ts'
import type { SendOutcome } from './sender.ts'
import { SessionTracker } from './session-tracker.ts'
import { fakeClock, fakeStorage } from './test-helpers.ts'
import type { WireEvent } from './types.ts'

function makePipeline(outcomes: SendOutcome[] = ['ok']) {
  const storage = fakeStorage()
  const clock = fakeClock()
  const queue = new EventQueue(fakeStorage(), 100)
  const sent: WireEvent[][] = []
  let call = 0
  const pipeline = new Pipeline({
    queue,
    sessions: new SessionTracker(storage, { timeoutMs: 1_000, maxAgeMs: 10_000, now: clock.now }),
    consent: new ConsentStore(storage),
    send: async (events) => {
      sent.push(events)
      return outcomes[Math.min(call++, outcomes.length - 1)]!
    },
    now: clock.now,
  })
  return { pipeline, queue, sent, clock }
}

describe('Pipeline', () => {
  it('opens a session before the first event', () => {
    const { pipeline, queue } = makePipeline()
    pipeline.enqueue('tap')
    const [start, tap] = queue.nextBatch({ maxEvents: 10, maxBytes: 60_000 })
    assert.equal(start?.name, 'session_start')
    assert.equal(tap?.name, 'tap')
    assert.equal(tap?.sessionId, start?.sessionId)
  })

  it('stamps the duration on session_end', () => {
    const { pipeline, queue, clock } = makePipeline()
    pipeline.enqueue('tap')
    clock.advance(2_000)
    pipeline.enqueue('tap')
    const end = queue.nextBatch({ maxEvents: 10, maxBytes: 60_000 }).find((e) => e.name === 'session_end')
    assert.deepEqual(end?.props, { duration_ms: 0 })
  })

  it('uploads nothing until uploads are enabled', async () => {
    const { pipeline, queue, sent } = makePipeline()
    pipeline.enqueue('tap')
    await pipeline.flush()
    assert.equal(sent.length, 0)

    pipeline.enableUploads()
    await pipeline.flush()
    assert.equal(sent.length, 1)
    assert.equal(queue.size, 0)
  })

  it('makes a flush called mid-flight wait for the events queued meanwhile', async () => {
    const { pipeline, queue, sent } = makePipeline()
    pipeline.enableUploads()
    pipeline.enqueue('tap')
    const first = pipeline.flush()
    pipeline.enqueue('tap')
    await pipeline.flush()
    await first
    assert.equal(queue.size, 0)
    assert.equal(sent.flat().length, 3)
  })

  it('keeps the backlog while consent is unknown, sends it once granted', async () => {
    const { pipeline, sent } = makePipeline()
    pipeline.setConsent('unknown')
    pipeline.enableUploads()
    pipeline.enqueue('tap')
    await pipeline.flush()
    assert.equal(sent.length, 0)

    pipeline.setConsent('granted')
    await pipeline.flush()
    assert.equal(sent.length, 1)
  })

  it('purges and mutes on denied', () => {
    const { pipeline, queue } = makePipeline()
    pipeline.enqueue('tap')
    pipeline.setConsent('denied')
    pipeline.enqueue('tap')
    assert.equal(queue.size, 0)
  })

  it('drops the batch and pauses on quota exceeded', async () => {
    const { pipeline, queue, sent, clock } = makePipeline(['quota_exceeded', 'ok'])
    pipeline.enableUploads()
    pipeline.enqueue('tap')
    await pipeline.flush()
    assert.equal(queue.size, 0)

    pipeline.enqueue('tap')
    await pipeline.flush()
    assert.equal(sent.length, 1)

    clock.advance(PIPELINE_CONFIG.quotaCooldownMs)
    await pipeline.flush()
    assert.equal(sent.length, 2)
  })

  it('keeps the batch on a transient failure', async () => {
    const { pipeline, queue } = makePipeline(['retry'])
    pipeline.enableUploads()
    pipeline.enqueue('tap')
    await pipeline.flush()
    assert.equal(queue.size, 2)
    pipeline.shutdown()
  })

  it('stops capturing after shutdown', () => {
    const { pipeline, queue } = makePipeline()
    pipeline.enqueue('tap')
    pipeline.shutdown()
    pipeline.enqueue('tap')
    assert.equal(queue.size, 0)
  })
})

describe('backoffDelay', () => {
  it('doubles from 2 s with jitter, capped at 5 min', () => {
    assert.equal(backoffDelay(0, () => 1), 2_000)
    assert.equal(backoffDelay(0, () => 0), 1_000)
    assert.equal(backoffDelay(3, () => 1), 16_000)
    assert.equal(backoffDelay(50, () => 1), 300_000)
  })
})
