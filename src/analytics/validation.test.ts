import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { uuid7 } from './uuid7.ts'
import { isCustomEventName, sanitizeProps, sanitizeScreen } from './validation.ts'

describe('isCustomEventName', () => {
  it('accepts snake_case names', () => {
    assert.equal(isCustomEventName('purchase_completed'), true)
  })

  it('rejects bad alphabets and reserved names', () => {
    assert.equal(isCustomEventName('Purchase'), false)
    assert.equal(isCustomEventName('1st_visit'), false)
    assert.equal(isCustomEventName('a'.repeat(65)), false)
    assert.equal(isCustomEventName('screen_view'), false)
    assert.equal(isCustomEventName('session_start'), false)
  })
})

describe('sanitizeProps', () => {
  it('keeps scalars and drops everything else', () => {
    const props = { plan: 'pro', seats: 3, trial: false, nan: NaN, nested: {} } as never
    assert.deepEqual(sanitizeProps(props), { plan: 'pro', seats: 3, trial: false })
  })

  it('truncates strings and caps the count at 20, alphabetically', () => {
    const props: Record<string, string> = {}
    for (let i = 0; i < 25; i++) props[`k${String(i).padStart(2, '0')}`] = 'x'.repeat(300)
    const clean = sanitizeProps(props)!
    assert.equal(Object.keys(clean).length, 20)
    assert.equal(clean.k00, 'x'.repeat(256))
    assert.equal(clean.k20, undefined)
  })

  it('returns undefined when nothing survives', () => {
    assert.equal(sanitizeProps({}), undefined)
  })
})

describe('sanitizeScreen', () => {
  it('caps at 128 characters', () => {
    assert.equal(sanitizeScreen('/'.repeat(200)).length, 128)
  })
})

describe('uuid7', () => {
  it('is a version 7 uuid carrying its timestamp', () => {
    const at = Date.UTC(2026, 9, 2)
    const id = uuid7(at)
    assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    assert.equal(parseInt(id.replace(/-/g, '').slice(0, 12), 16), at)
  })
})
