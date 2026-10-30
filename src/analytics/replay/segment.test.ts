import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { REPLAY_LIMITS } from './config.ts'
import { compressEvents, Segment, type RecordedEvent } from './segment.ts'

const START = Date.UTC(2026, 9, 5, 12)
const VIEWPORT = { width: 1000, height: 500 }
const SESSION = '0192a000-0000-7000-8000-000000000001'

function click(at: number, x: number, y: number): RecordedEvent {
  return { type: 3, timestamp: at, data: { source: 2, type: 2, id: 12, x, y } }
}

describe('Segment', () => {
  it('turns clicks into touches normalized to the viewport', () => {
    const segment = new Segment(START)
    segment.add({ type: 4, timestamp: START, data: { href: 'https://shop.example/', width: 1000, height: 500 } }, VIEWPORT)
    segment.add(click(START + 1_250, 250, 400), VIEWPORT)
    // Mouse moves and other interactions are events, not touches.
    segment.add({ type: 3, timestamp: START + 1_300, data: { source: 1, positions: [] } }, VIEWPORT)
    segment.add({ type: 3, timestamp: START + 1_400, data: { source: 2, type: 5, x: 1, y: 1 } }, VIEWPORT)
    segment.add(click(START + 2_000, 2_000, -10), VIEWPORT)

    assert.equal(segment.events.length, 5)
    assert.deepEqual(segment.touches, [
      { t: 1_250, x: 0.25, y: 0.8 },
      { t: 2_000, x: 1, y: 0 },
    ])
  })

  it('caps touches at the contract limit', () => {
    const segment = new Segment(START)
    for (let i = 0; i < REPLAY_LIMITS.maxTouches + 5; i++) segment.add(click(START + i, 1, 1), VIEWPORT)
    assert.equal(segment.touches.length, REPLAY_LIMITS.maxTouches)
  })

  it('records screens once each, relative to the segment start', () => {
    const segment = new Segment(START)
    segment.addScreen('/cart', START)
    segment.addScreen('/cart', START + 10)
    segment.addScreen('/checkout', START + 3_000)
    segment.addScreen('', START + 4_000)
    assert.deepEqual(segment.screens, [
      { t: 0, name: '/cart' },
      { t: 3_000, name: '/checkout' },
    ])
  })

  it('builds the meta the ingestion route validates', () => {
    const segment = new Segment(START)
    segment.add(click(START + 500, 500, 250), VIEWPORT)
    segment.addScreen('/', START)
    assert.deepEqual(segment.meta(SESSION, 3, START + 10_000), {
      sessionId: SESSION,
      seq: 3,
      kind: 'rrweb',
      runtime: 'web',
      startedAt: '2026-10-05T12:00:00.000Z',
      endedAt: '2026-10-05T12:00:10.000Z',
      screens: [{ t: 0, name: '/' }],
      touches: [{ t: 500, x: 0.5, y: 0.5 }],
    })
  })
})

describe('compressEvents', () => {
  it('gzips the events as a JSON array', async () => {
    const events = [click(START, 1, 2), { type: 4, timestamp: START, data: { href: 'x' } }]
    const blob = await compressEvents(events)
    assert.equal(blob.type, 'application/gzip')
    const text = await new Response(blob.stream().pipeThrough(new DecompressionStream('gzip'))).text()
    assert.deepEqual(JSON.parse(text), events)
  })
})
