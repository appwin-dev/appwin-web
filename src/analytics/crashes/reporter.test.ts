import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { ConsentStore } from '../consent.ts'
import { fakeClock, fakeStorage } from '../test-helpers.ts'
import { CrashQueue } from './crash-queue.ts'
import { installCrashHandlers } from './handlers.ts'
import { CRASH_CONFIG, CrashReporter, type CapturedError } from './reporter.ts'
import type { SendCrashes } from './sender.ts'
import type { CrashReport } from './types.ts'

type Outcome = Awaited<ReturnType<SendCrashes>>

function makeReporter(outcome: Outcome = 'ok') {
  const storage = fakeStorage()
  const clock = fakeClock()
  const consent = new ConsentStore(storage)
  const queue = new CrashQueue(storage)
  const sent: CrashReport[][] = []
  const reporter = new CrashReporter({
    queue,
    consent,
    send: async (reports) => {
      sent.push(reports)
      return outcome
    },
    stack: { origin: 'https://shop.example' },
    context: () => ({
      appVersion: '2.0.0',
      os: 'macOS',
      model: 'Chrome 140',
      sdkVersion: '0.10.1',
      sessionId: '0192a000-0000-7000-8000-000000000000',
      screen: '/cart',
      breadcrumbs: [{ at: '2026-10-04T12:00:00.000Z', type: 'screen', name: '/cart' }],
    }),
    now: clock.now,
  })
  return { reporter, queue, consent, sent, clock }
}

function thrown(message = 'boom'): CapturedError {
  const error = new Error(message)
  error.stack = `Error: ${message}\n    at pay (https://shop.example/app.js:12:3)`
  return { kind: 'crash', thrown: { type: 'Error', message, stack: error.stack } }
}

const settle = () => new Promise((resolve) => setImmediate(resolve))

describe('CrashReporter', () => {
  it('stores a report and sends it once uploads are enabled', async () => {
    const { reporter, queue, sent } = makeReporter()
    reporter.capture(thrown())
    assert.equal(queue.size, 1)
    assert.equal(sent.length, 0)

    await reporter.enableUploads()
    await settle()
    assert.equal(sent.length, 1)
    const [report] = sent[0]!
    assert.equal(report?.kind, 'crash')
    assert.equal(report?.runtime, 'web')
    assert.equal(report?.app.version, '2.0.0')
    assert.equal(report?.screen, '/cart')
    assert.deepEqual(report?.frames[0], {
      fn: 'pay',
      file: '/app.js',
      module: 'https://shop.example',
      line: 12,
      col: 3,
      inApp: true,
    })
    assert.equal(queue.size, 0)
  })

  it('keeps the report when the send fails', async () => {
    const { reporter, queue } = makeReporter('retry')
    reporter.enableUploads()
    reporter.capture(thrown())
    await settle()
    assert.equal(queue.size, 1)
    reporter.shutdown()
  })

  it('drops a report the server refused for good', async () => {
    const { reporter, queue } = makeReporter('drop')
    reporter.enableUploads()
    reporter.capture(thrown())
    await settle()
    assert.equal(queue.size, 0)
  })

  it('captures nothing and purges the queue when consent is denied', () => {
    const { reporter, queue, consent } = makeReporter()
    reporter.capture(thrown('first'))
    consent.set('denied')
    reporter.onConsentChange('denied')
    assert.equal(queue.size, 0)
    reporter.capture(thrown('second'))
    assert.equal(queue.size, 0)
  })

  it('stores but never sends while consent is unknown', async () => {
    const { reporter, queue, consent, sent } = makeReporter()
    consent.set('unknown')
    reporter.enableUploads()
    reporter.capture(thrown())
    await settle()
    assert.equal(sent.length, 0)
    assert.equal(queue.size, 1)

    consent.set('granted')
    reporter.onConsentChange('granted')
    await settle()
    assert.equal(sent.length, 1)
  })

  it('drops the same error repeated within the dedupe window', () => {
    const { reporter, queue, clock } = makeReporter()
    reporter.capture(thrown())
    reporter.capture(thrown())
    assert.equal(queue.size, 1)
    reporter.capture(thrown('another'))
    assert.equal(queue.size, 2)
    clock.advance(CRASH_CONFIG.dedupeWindowMs + 1)
    reporter.capture(thrown())
    assert.equal(queue.size, 3)
  })

  it('stops after the per-page cap', () => {
    const { reporter, queue } = makeReporter()
    for (let i = 0; i < CRASH_CONFIG.maxReportsPerPage + 5; i++) reporter.capture(thrown(`e${i}`))
    assert.equal(queue.size, CRASH_CONFIG.maxReportsPerPage)
  })

  it('clears everything on shutdown', () => {
    const { reporter, queue } = makeReporter()
    reporter.capture(thrown())
    reporter.shutdown()
    assert.equal(queue.size, 0)
    reporter.capture(thrown('later'))
    assert.equal(queue.size, 0)
  })
})

describe('installCrashHandlers', () => {
  function dispatch(target: EventTarget, type: string, fields: Record<string, unknown>) {
    const event = new Event(type)
    Object.assign(event, fields)
    target.dispatchEvent(event)
  }

  it('reports uncaught errors and unhandled rejections as crashes', async () => {
    const { reporter, sent } = makeReporter()
    const target = new EventTarget()
    const uninstall = installCrashHandlers(target, reporter)
    reporter.enableUploads()

    const error = new TypeError('x is undefined')
    error.stack = 'TypeError: x is undefined\n    at run (https://shop.example/app.js:1:1)'
    dispatch(target, 'error', { error })
    dispatch(target, 'unhandledrejection', { reason: 'timeout' })
    dispatch(target, 'error', {
      message: 'Script error.',
      filename: 'https://cdn.example/x.js',
      lineno: 0,
    })
    await settle()

    const reports = sent.flat()
    assert.deepEqual(
      reports.map((report) => [report.kind, report.exception.type, report.exception.message]),
      [
        ['crash', 'TypeError', 'x is undefined'],
        ['crash', 'UnhandledRejection', 'timeout'],
        ['crash', 'Error', 'Script error.'],
      ],
    )
    assert.deepEqual(reports[2]?.frames, [
      { fn: '', file: '/x.js', module: 'https://cdn.example', inApp: false },
    ])

    uninstall()
    dispatch(target, 'error', { error: new Error('after uninstall') })
    await settle()
    assert.equal(sent.flat().length, 3)
  })

  it('ignores resource load errors', () => {
    const { reporter, queue } = makeReporter()
    const target = new EventTarget()
    installCrashHandlers(target, reporter)
    const image = new EventTarget()
    // A failed <img> load: dispatched on the element, seen by a capturing listener on window.
    target.addEventListener('error', () => {}, true)
    const event = new Event('error')
    Object.defineProperty(event, 'target', { value: image })
    target.dispatchEvent(event)
    assert.equal(queue.size, 0)
  })
})
