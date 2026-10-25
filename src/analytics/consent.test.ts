import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { ConsentStore } from './consent.ts'
import { fakeStorage } from './test-helpers.ts'

describe('ConsentStore', () => {
  it('spreads the legacy single consent over the three purposes, then drops it', () => {
    const storage = fakeStorage()
    storage.set('analytics:consent', 'denied')
    const store = new ConsentStore(storage)
    assert.equal(store.state('marketing'), 'denied')
    assert.equal(storage.get('consent:marketing'), 'denied')
    assert.equal(storage.get('analytics:consent'), null)
  })

  it('never overwrites an answer already given for a purpose', () => {
    const storage = fakeStorage()
    storage.set('analytics:consent', 'denied')
    storage.set('consent:marketing', 'granted')
    const store = new ConsentStore(storage)
    assert.equal(store.state('marketing'), 'granted')
    assert.equal(store.state('analytics'), 'denied')
    assert.equal(store.state('advertising'), 'denied')
  })

  it('defaults every purpose to granted and sets the three without a purpose', () => {
    const store = new ConsentStore(fakeStorage())
    assert.deepEqual(store.grantedPurposes, ['analytics', 'marketing', 'advertising'])
    store.set('unknown')
    assert.equal(store.anyUnknown, true)
    store.set('denied')
    assert.equal(store.allDenied, true)
    store.set('granted', 'marketing')
    assert.deepEqual(store.grantedPurposes, ['marketing'])
    assert.equal(store.allDenied, false)
  })
})
