import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { fakeStorage } from '../test-helpers.ts'
import { REPLAY_LIMITS } from './config.ts'
import { RecordingState } from './recording-state.ts'
import { Segment } from './segment.ts'
import { SegmentShipper } from './shipper.ts'
import type { QueuedSegment } from './uploader.ts'

const SESSION = '0192a000-0000-7000-8000-000000000001'
const START = Date.UTC(2026, 9, 5, 12)

function deferred() {
  let resolve!: (blob: Blob) => void
  const promise = new Promise<Blob>((r) => (resolve = r))
  return { promise, resolve }
}

function blob(bytes: number): Blob {
  return new Blob([new Uint8Array(bytes)])
}

function segment(at = START): Segment {
  const s = new Segment(at)
  s.add({ type: 2, timestamp: at }, { width: 100, height: 100 })
  return s
}

function makeShipper(compressions: Promise<Blob>[]) {
  const state = new RecordingState(fakeStorage())
  const pushed: QueuedSegment[] = []
  const oversized: string[] = []
  const spent: string[] = []
  const shipper = new SegmentShipper({
    state,
    compress: () => compressions.shift() ?? Promise.resolve(blob(10)),
    push: (s) => pushed.push(s),
    onOversized: (id) => oversized.push(id),
    onBudgetSpent: (id) => spent.push(id),
  })
  return { shipper, state, pushed, oversized, spent }
}

describe('SegmentShipper', () => {
  it('drops a segment still compressing when the recording is discarded', async () => {
    const pending = deferred()
    const { shipper, pushed } = makeShipper([pending.promise])
    const shipped = shipper.ship(segment(), SESSION, START + 10_000)
    shipper.discard()
    pending.resolve(blob(10))
    await shipped
    assert.equal(pushed.length, 0)

    await shipper.ship(segment(), SESSION, START + 20_000)
    assert.equal(pushed.length, 1)
  })

  it('claims neither a seq nor budget for an oversized segment', async () => {
    const { shipper, state, pushed, oversized } = makeShipper([
      Promise.resolve(blob(REPLAY_LIMITS.segmentMaxBytes + 1)),
    ])
    await shipper.ship(segment(), SESSION, START + 10_000)
    assert.deepEqual(oversized, [SESSION])
    assert.equal(pushed.length, 0)

    await shipper.ship(segment(), SESSION, START + 20_000)
    assert.equal(pushed[0]?.meta.seq, 0)
    assert.equal(state.claimSegment(SESSION, 0).seq, 1)
  })

  it('numbers segments in cut order, whichever compresses first', async () => {
    const first = deferred()
    const second = deferred()
    const { shipper, pushed } = makeShipper([first.promise, second.promise])
    void shipper.ship(segment(START), SESSION, START + 10_000)
    const last = shipper.ship(segment(START + 10_000), SESSION, START + 20_000)
    second.resolve(blob(10))
    first.resolve(blob(10))
    await last
    assert.deepEqual(
      pushed.map((s) => [s.meta.seq, s.meta.startedAt]),
      [
        [0, new Date(START).toISOString()],
        [1, new Date(START + 10_000).toISOString()],
      ],
    )
  })

  it('reports the spent budget, then ships nothing more for the session', async () => {
    const { shipper, pushed, spent } = makeShipper([])
    await shipper.ship(segment(START), SESSION, START + REPLAY_LIMITS.maxSessionMs)
    assert.deepEqual(spent, [SESSION])
    await shipper.ship(segment(START), SESSION, START + 10_000)
    assert.equal(pushed.length, 1)
  })
})
