import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { uuid7 } from '../uuid7.ts'
import { isSampled, parseReplaySettings, REPLAY_LIMITS } from './config.ts'
import { blockSelector, maskText, maskTextSelector } from './masking.ts'
import { RecordingState } from './recording-state.ts'
import { fakeStorage } from '../test-helpers.ts'

describe('parseReplaySettings', () => {
  it('masks everything and records every session when the config is missing', () => {
    assert.deepEqual(parseReplaySettings(undefined), { sampleRate: 1, maskAllText: true, maskAllImages: true })
  })

  it('reads the dashboard settings and ignores malformed ones', () => {
    assert.deepEqual(parseReplaySettings({ sampleRate: 0.25, maskAllText: false, maskAllImages: false }), {
      sampleRate: 0.25,
      maskAllText: false,
      maskAllImages: false,
    })
    assert.deepEqual(parseReplaySettings({ sampleRate: 4, maskAllText: 'no' }), {
      sampleRate: 1,
      maskAllText: true,
      maskAllImages: true,
    })
  })
})

describe('isSampled', () => {
  it('reads the last 32 bits of the id as a fraction', () => {
    assert.equal(isSampled('0192a000-0000-7000-8000-000000000000', 0.01), true)
    assert.equal(isSampled('0192a000-0000-7000-8000-0000ffffffff', 0.99), false)
    assert.equal(isSampled('0192a000-0000-7000-8000-00007fffffff', 0.5), true)
    assert.equal(isSampled('0192a000-0000-7000-8000-000080000000', 0.5), false)
  })

  it('always or never at the bounds', () => {
    assert.equal(isSampled('0192a000-0000-7000-8000-0000ffffffff', 1), true)
    assert.equal(isSampled('0192a000-0000-7000-8000-000000000000', 0), false)
  })

  it('spreads sessions started in the same second, which share their leading bits', () => {
    const at = Date.UTC(2026, 9, 5, 12)
    const sampled = Array.from({ length: 2_000 }, () => uuid7(at)).filter((id) => isSampled(id, 0.3))
    assert.ok(sampled.length > 450 && sampled.length < 750, `${sampled.length} of 2000`)
  })
})

describe('masking', () => {
  const element = (unmasked: boolean, editable = false) => ({
    closest: (selector: string) =>
      (selector.startsWith('[contenteditable]') ? editable : unmasked) ? ({} as Element) : null,
  })

  it('masks every visible character unless an ancestor opts out', () => {
    assert.equal(maskText('Ada Lovelace\n', element(false)), '*** ********\n')
    assert.equal(maskText('Ada Lovelace', element(true)), 'Ada Lovelace')
    assert.equal(maskText('Ada', null), '***')
  })

  it('masks typed text even under an unmask marker', () => {
    assert.equal(maskText('Ada', element(true, true)), '***')
    assert.equal(maskText('Ada', element(false, true)), '***')
  })

  it('selects every text with maskAllText, and editable content always', () => {
    assert.equal(maskTextSelector({ maskAllText: true }), '*')
    assert.equal(maskTextSelector({ maskAllText: false }), '[contenteditable]:not([contenteditable="false"])')
  })

  it('always blocks the widget and marked elements, images per the settings', () => {
    const bare = blockSelector({ maskAllImages: false })
    assert.equal(bare, '[data-appwin-mask], [data-appwin-widget]')
    const images = blockSelector({ maskAllImages: true })
    assert.ok(images.startsWith(bare))
    assert.ok(images.includes('img:not([data-appwin-unmask], [data-appwin-unmask] *)'))
  })
})

describe('RecordingState', () => {
  const id = '0192a000-0000-7000-8000-000000000001'

  it('numbers segments per session and starts over for a new one', () => {
    const storage = fakeStorage()
    const state = new RecordingState(storage)
    assert.equal(state.claimSegment(id, 10_000).seq, 0)
    // A reload, or another tab, reads the same storage.
    assert.equal(new RecordingState(storage).claimSegment(id, 10_000).seq, 1)
    assert.equal(state.claimSegment('0192a000-0000-7000-8000-000000000002', 10_000).seq, 0)
  })

  it('spends a one hour budget per session', () => {
    const state = new RecordingState(fakeStorage())
    assert.equal(state.claimSegment(id, REPLAY_LIMITS.maxSessionMs - 1).budgetLeft, true)
    assert.equal(state.hasBudget(id), true)
    assert.equal(state.claimSegment(id, 1).budgetLeft, false)
    assert.equal(state.hasBudget(id), false)
  })
})
