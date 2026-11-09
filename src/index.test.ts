import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'

import { createAppwin, type AnalyticsConsent, type ConsentPurpose, type ConsentState } from './index.ts'

interface SentEvent {
  name: string
  purposes?: string[]
}

const realFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = realFetch
})

/** Answers the session init and records every event batch the SDK uploads. */
function stubApi(analytics: { enabled: boolean; reason?: string } = { enabled: true }): SentEvent[][] {
  const batches: SentEvent[][] = []
  globalThis.fetch = (async (url: string, init: RequestInit) => {
    const json = (body: unknown) =>
      new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })
    if (url.endsWith('/api/sdk/v1/events')) {
      const { events } = JSON.parse(init.body as string) as { events: SentEvent[] }
      batches.push(events)
      return json({ accepted: events.length, rejected: 0 })
    }
    if (url.endsWith('/api/sdk/v1/availability')) return json({ products: { analytics } })
    return json({ token: 't1', customerSessionId: 's1', expiresAt: null })
  }) as unknown as typeof fetch
  return batches
}

describe('createAppwin analytics', () => {
  it('sends appwin.track from creation, without initialize(), with its purposes', async () => {
    const batches = stubApi()
    const appwin = createAppwin({ appId: 'app-1', apiUrl: 'https://api.test' })
    appwin.track('purchase', { plan: 'pro' })
    await appwin.analytics.flush()
    assert.deepEqual(
      batches[0]?.map((e) => [e.name, e.purposes]),
      [
        ['session_start', ['analytics', 'marketing', 'advertising']],
        ['purchase', ['analytics', 'marketing', 'advertising']],
      ],
    )
  })

  it('keeps appwin.analytics.track and setConsent working, through the same pipeline', async () => {
    const batches = stubApi()
    const appwin = createAppwin({ appId: 'app-2', apiUrl: 'https://api.test' })
    appwin.analytics.setConsent('denied')
    appwin.analytics.track('purchase')
    appwin.setConsent('granted', 'analytics')
    appwin.analytics.track('legacy')
    await appwin.analytics.flush()
    assert.deepEqual(
      batches[0]?.map((e) => [e.name, e.purposes]),
      [
        ['session_start', ['analytics']],
        ['legacy', ['analytics']],
      ],
    )
  })

  it('exports ConsentState and ConsentPurpose, AnalyticsConsent stays as an alias', () => {
    const state: ConsentState = 'unknown'
    const legacy: AnalyticsConsent = state
    const purpose: ConsentPurpose = 'advertising'
    assert.deepEqual([legacy, purpose], ['unknown', 'advertising'])
  })

  it('keeps sending events when initialize() finds Analytics unavailable', async () => {
    const batches = stubApi({ enabled: false, reason: 'plan' })
    const appwin = createAppwin({ appId: 'app-5', apiUrl: 'https://api.test' })
    assert.deepEqual(await appwin.analytics.initialize({ pageViews: false, crashReporting: false }), {
      ready: false,
      reason: 'plan',
    })
    appwin.track('purchase')
    await appwin.analytics.flush()
    assert.deepEqual(batches.flat().map((e) => e.name), ['session_start', 'purchase'])
  })

  it('emits no lifecycle event without a DOM', async () => {
    const batches = stubApi()
    const appwin = createAppwin({ appId: 'app-3', apiUrl: 'https://api.test' })
    await appwin.analytics.flush()
    assert.equal(batches.length, 0)
  })
})

describe('createAppwin lifecycle', () => {
  const realDocument = Object.getOwnPropertyDescriptor(globalThis, 'document')
  afterEach(() => {
    if (realDocument) Object.defineProperty(globalThis, 'document', realDocument)
    else delete (globalThis as { document?: unknown }).document
  })

  function fakeDocument() {
    const listeners: Array<() => void> = []
    const doc = {
      visibilityState: 'visible',
      addEventListener: (_type: string, listener: () => void) => void listeners.push(listener),
      removeEventListener: () => {},
      show: () => {
        doc.visibilityState = 'visible'
        listeners.forEach((listener) => listener())
      },
      hide: () => {
        doc.visibilityState = 'hidden'
        listeners.forEach((listener) => listener())
      },
    }
    Object.defineProperty(globalThis, 'document', { value: doc, configurable: true, writable: true })
    return doc
  }

  it('opens the session and the app at creation, then follows the tab', async () => {
    const batches = stubApi()
    const doc = fakeDocument()
    const appwin = createAppwin({ appId: 'app-4', apiUrl: 'https://api.test' })
    appwin.track('purchase')
    doc.hide()
    doc.show()
    await appwin.analytics.flush()
    assert.deepEqual(
      batches.flat().map((e) => e.name),
      ['session_start', 'app_open', 'purchase', 'app_background', 'app_open'],
    )
  })
})
