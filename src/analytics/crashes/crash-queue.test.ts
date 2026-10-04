import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { fakeStorage } from '../test-helpers.ts'
import { Breadcrumbs, MAX_BREADCRUMBS } from './breadcrumbs.ts'
import { CrashQueue, MAX_QUEUED_CRASHES } from './crash-queue.ts'
import { buildReport, byteLength, describeThrown, MAX_REPORT_BYTES } from './report.ts'
import type { CrashContext, CrashFrame } from './types.ts'

const context: CrashContext = {
  appVersion: '1.0.0',
  os: 'macOS',
  model: 'Chrome 140',
  sdkVersion: '0.10.1',
  sessionId: null,
  screen: null,
  breadcrumbs: [],
}

function report(message = 'boom', frames: CrashFrame[] = []) {
  return buildReport('crash', { type: 'Error', message }, frames, context, Date.UTC(2026, 9, 4))
}

describe('Breadcrumbs', () => {
  it('keeps the last 20 and knows the current screen', () => {
    const crumbs = new Breadcrumbs()
    crumbs.add('screen', '/home')
    for (let i = 0; i < 25; i++) crumbs.add('event', `tap_${i}`)
    const items = crumbs.snapshot()
    assert.equal(items.length, MAX_BREADCRUMBS)
    assert.equal(items[0]?.name, 'tap_5')
    assert.equal(crumbs.screen, '/home')
    crumbs.add('screen', '/cart')
    assert.equal(crumbs.screen, '/cart')
  })
})

describe('CrashQueue', () => {
  it('keeps the newest 20 reports', () => {
    const queue = new CrashQueue(fakeStorage())
    for (let i = 0; i < 25; i++) queue.push(report(`e${i}`))
    assert.equal(queue.size, MAX_QUEUED_CRASHES)
    assert.equal(queue.nextBatch(1_000_000)[0]?.exception.message, 'e5')
  })

  it('is shared through storage, so another tab sees the same reports', () => {
    const storage = fakeStorage()
    new CrashQueue(storage).push(report())
    assert.equal(new CrashQueue(storage).size, 1)
  })

  it('batches by size, always at least one', () => {
    const queue = new CrashQueue(fakeStorage())
    queue.push(report('a'))
    queue.push(report('b'))
    assert.equal(queue.nextBatch(1).length, 1)
    assert.equal(queue.nextBatch(1_000_000).length, 2)
  })

  it('removes by id', () => {
    const queue = new CrashQueue(fakeStorage())
    queue.push(report('a'))
    queue.push(report('b'))
    queue.remove(queue.nextBatch(1))
    assert.equal(queue.nextBatch(1_000_000)[0]?.exception.message, 'b')
  })
})

describe('buildReport', () => {
  it('trims frames, then the message, to fit the size cap', () => {
    const frames: CrashFrame[] = Array.from({ length: 200 }, (_, i) => ({
      fn: `f${i}`.padEnd(500, 'x'),
      file: '/a.js'.padEnd(500, 'y'),
      inApp: true,
    }))
    const built = report('m'.repeat(2_000), frames)
    assert.ok(byteLength(built) <= MAX_REPORT_BYTES)
    assert.ok(built.frames.length > 0 && built.frames.length < 200)
    assert.equal(built.frames[0]?.fn.startsWith('f0'), true)
    assert.equal(built.exception.message?.length, 1024)
  })

  it('describes whatever was thrown', () => {
    assert.deepEqual(describeThrown(new TypeError('nope'), 'Error').type, 'TypeError')
    assert.deepEqual(describeThrown('plain string', 'UnhandledRejection'), {
      type: 'UnhandledRejection',
      message: 'plain string',
    })
    assert.deepEqual(describeThrown({ code: 42 }, 'UnhandledRejection'), {
      type: 'UnhandledRejection',
      message: '{"code":42}',
    })
    assert.deepEqual(describeThrown(undefined, 'UnhandledRejection'), {
      type: 'UnhandledRejection',
    })
  })
})
