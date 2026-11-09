import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'

import { Session } from '../../core/session.ts'
import { fakeStorage } from '../test-helpers.ts'
import { REPLAY_LIMITS } from './config.ts'
import type { SegmentMeta } from './segment.ts'
import { createReplaySender, ReplayUploader, type QueuedSegment, type ReplaySendOutcome } from './uploader.ts'

const settle = () => new Promise((resolve) => setImmediate(resolve))

function segment(seq: number, bytes = 100): QueuedSegment {
  const meta: SegmentMeta = {
    sessionId: '0192a000-0000-7000-8000-000000000001',
    seq,
    kind: 'rrweb',
    runtime: 'web',
    startedAt: '2026-10-05T12:00:00.000Z',
    endedAt: '2026-10-05T12:00:10.000Z',
    screens: [],
    touches: [],
  }
  return { meta, blob: new Blob([new Uint8Array(bytes)], { type: 'application/gzip' }) }
}

function makeUploader(outcomes: ReplaySendOutcome[]) {
  const sent: { seq: number; keepalive: boolean }[] = []
  let disabled = 0
  const uploader = new ReplayUploader({
    send: async (item, keepalive) => {
      sent.push({ seq: item.meta.seq, keepalive })
      return outcomes.shift() ?? 'ok'
    },
    onDisabled: () => void (disabled += 1),
  })
  return { uploader, sent, disabledCalls: () => disabled }
}

describe('ReplayUploader', () => {
  it('sends segments in order and forgets them once stored or refused', async () => {
    const { uploader, sent } = makeUploader(['ok', 'drop', 'ok'])
    uploader.push(segment(0))
    uploader.push(segment(1))
    uploader.push(segment(2))
    await settle()
    assert.deepEqual(sent.map((s) => s.seq), [0, 1, 2])
    assert.equal(uploader.size, 0)
  })

  it('keeps a segment the network refused, and stops there', async () => {
    const { uploader, sent } = makeUploader(['retry'])
    uploader.push(segment(0))
    uploader.push(segment(1))
    await settle()
    assert.deepEqual(sent.map((s) => s.seq), [0])
    assert.equal(uploader.size, 2)
    uploader.clear()
  })

  it('stops for good on a 403: queue purged, nothing sent afterwards', async () => {
    const { uploader, sent, disabledCalls } = makeUploader(['disabled'])
    uploader.push(segment(0))
    uploader.push(segment(1))
    await settle()
    assert.equal(disabledCalls(), 1)
    assert.equal(uploader.size, 0)

    uploader.push(segment(2))
    await uploader.flush()
    assert.deepEqual(sent.map((s) => s.seq), [0])
  })

  it('uses keepalive only while leaving, and only under the browser limit', async () => {
    const { uploader, sent } = makeUploader([])
    uploader.push(segment(0))
    await settle()
    uploader.leaving = true
    uploader.push(segment(1, 1_000))
    uploader.push(segment(2, REPLAY_LIMITS.keepaliveMaxBytes))
    await settle()
    assert.deepEqual(sent, [
      { seq: 0, keepalive: false },
      { seq: 1, keepalive: true },
      { seq: 2, keepalive: false },
    ])
  })

  it('sends at once when the page leaves, instead of waiting out the backoff', async () => {
    const { uploader, sent } = makeUploader(['retry'])
    uploader.push(segment(0))
    await settle()
    assert.equal(sent.length, 1)

    await uploader.flush()
    assert.equal(sent.length, 1)

    uploader.leaving = true
    await uploader.flush()
    assert.deepEqual(sent[1], { seq: 0, keepalive: true })
    assert.equal(uploader.size, 0)
  })

  it('never queues a segment over the size limit', async () => {
    const { uploader, sent } = makeUploader([])
    uploader.push(segment(0, REPLAY_LIMITS.segmentMaxBytes + 1))
    await settle()
    assert.equal(sent.length, 0)
  })
})

describe('createReplaySender', () => {
  const realFetch = globalThis.fetch
  afterEach(() => {
    globalThis.fetch = realFetch
  })

  function makeSession(): Session {
    const storage = fakeStorage()
    storage.set('session-token', 'tok')
    return new Session({ appId: 'app', baseUrl: 'http://api.test', storage, sdkVersion: '0' })
  }

  function answer(status: number, body: unknown = { accepted: true }) {
    const requests: { url: string; init: RequestInit }[] = []
    globalThis.fetch = (async (url: string, init: RequestInit) => {
      requests.push({ url, init })
      return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
    }) as unknown as typeof fetch
    return requests
  }

  it('posts the meta and the gzipped events as multipart, with the bearer', async () => {
    const requests = answer(200)
    const outcome = await createReplaySender(makeSession())(segment(4), true)
    assert.equal(outcome, 'ok')

    const [request] = requests
    assert.equal(request?.url, 'http://api.test/api/sdk/v1/replays/segments')
    assert.equal(request?.init.keepalive, true)
    const headers = request?.init.headers as Record<string, string>
    assert.equal(headers.Authorization, 'Bearer tok')
    assert.equal(headers['Content-Type'], undefined)

    const form = request?.init.body as FormData
    const meta = JSON.parse(String(form.get('meta')))
    assert.equal(meta.seq, 4)
    assert.equal(meta.kind, 'rrweb')
    assert.match(meta.sentAt, /^\d{4}-\d{2}-\d{2}T/)
    const file = form.get('segment') as File
    assert.equal(file.name, 'segment.json.gz')
    assert.equal(file.type, 'application/gzip')
  })

  it('reads a 403 as replay switched off, a 400 or 413 as a segment to drop, a 503 as a retry', async () => {
    const send = createReplaySender(makeSession())
    answer(403, { message: 'Replay is disabled' })
    assert.equal(await send(segment(0), false), 'disabled')
    answer(413, { message: 'Too large' })
    assert.equal(await send(segment(0), false), 'drop')
    answer(400, { message: 'Bad meta' })
    assert.equal(await send(segment(0), false), 'drop')
    answer(503, {})
    assert.equal(await send(segment(0), false), 'retry')
  })
})
