import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { EventQueue } from './event-queue.ts'
import { fakeStorage } from './test-helpers.ts'
import type { WireEvent } from './types.ts'

function event(id: number, props?: WireEvent['props']): WireEvent {
  return {
    eventId: `id-${id}`,
    name: 'tap',
    occurredAt: '2026-10-02T12:00:00.000Z',
    ...(props ? { props } : {}),
  }
}

const LIMITS = { maxEvents: 500, maxBytes: 60_000 }

describe('EventQueue', () => {
  it('survives a reload', () => {
    const storage = fakeStorage()
    new EventQueue(storage, 10).push(event(1))
    assert.equal(new EventQueue(storage, 10).size, 1)
  })

  it('drops the oldest events past the cap', () => {
    const queue = new EventQueue(fakeStorage(), 2)
    queue.push(event(1))
    queue.push(event(2))
    queue.push(event(3))
    assert.deepEqual(
      queue.nextBatch(LIMITS).map((e) => e.eventId),
      ['id-2', 'id-3'],
    )
  })

  it('cuts batches by count and by bytes', () => {
    const queue = new EventQueue(fakeStorage(), 100)
    for (let i = 0; i < 5; i++) queue.push(event(i, { blob: 'x'.repeat(200) }))
    assert.equal(queue.nextBatch({ maxEvents: 2, maxBytes: 60_000 }).length, 2)
    assert.equal(queue.nextBatch({ maxEvents: 500, maxBytes: 600 }).length, 2)
  })

  it('always returns at least one event, even oversized', () => {
    const queue = new EventQueue(fakeStorage(), 10)
    queue.push(event(1, { blob: 'x'.repeat(256) }))
    assert.equal(queue.nextBatch({ maxEvents: 500, maxBytes: 10 }).length, 1)
  })

  it('removes the sent events only, wherever they now are', () => {
    const queue = new EventQueue(fakeStorage(), 10)
    queue.push(event(1))
    const batch = queue.nextBatch(LIMITS)
    queue.push(event(2))
    queue.remove(batch)
    assert.deepEqual(
      queue.nextBatch(LIMITS).map((e) => e.eventId),
      ['id-2'],
    )
  })

  it('starts empty from a corrupted entry', () => {
    const storage = fakeStorage()
    storage.set('analytics:queue', '{not json')
    assert.equal(new EventQueue(storage, 10).size, 0)
  })
})
