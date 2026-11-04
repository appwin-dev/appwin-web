import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'

import { shareAcrossSubdomains, type AppwinStorage } from './storage.ts'

/**
 * One visit across `www.`, `account.` and `app.` of a domain: each site has its own
 * `localStorage`, the cookie on the parent domain is what they share. A browser's cookie jar,
 * simplified: one value per name, `Max-Age=0` removes it.
 */
function cookieJar() {
  const jar = new Map<string, string>()
  const document = {
    get cookie() {
      return [...jar].map(([name, value]) => `${name}=${value}`).join('; ')
    },
    set cookie(line: string) {
      const [pair] = line.split(';')
      const [name, value] = pair!.split('=')
      if (/Max-Age=0/.test(line)) jar.delete(name!)
      else jar.set(name!, value!)
    },
  }
  return { jar, document }
}

/** A site's own store (its `localStorage`). */
function siteStorage(): AppwinStorage & { map: Map<string, string> } {
  const map = new Map<string, string>()
  return {
    map,
    get: (key) => map.get(key) ?? null,
    set: (key, value) => void map.set(key, value),
    remove: (key) => void map.delete(key),
  }
}

afterEach(() => {
  delete (globalThis as { document?: unknown }).document
})

describe('shareAcrossSubdomains', () => {
  it('continues the device and the session on the next site', () => {
    const { document } = cookieJar()
    Object.defineProperty(globalThis, 'document', { value: document, configurable: true })

    const landing = shareAcrossSubdomains(siteStorage(), 'app', '.example.com')
    landing.set('device-id', 'device-1')
    landing.set('analytics:session-id', 'session-1')

    // The product, another origin: nothing in its own storage, the visit goes on.
    const product = shareAcrossSubdomains(siteStorage(), 'app', '.example.com')
    assert.equal(product.get('device-id'), 'device-1')
    assert.equal(product.get('analytics:session-id'), 'session-1')
  })

  it("keeps each site's token and the queue to itself", () => {
    const { jar, document } = cookieJar()
    Object.defineProperty(globalThis, 'document', { value: document, configurable: true })

    const landing = shareAcrossSubdomains(siteStorage(), 'app', '.example.com')
    landing.set('session-token', 'secret')
    landing.set('analytics:queue', '[]')

    assert.equal(jar.size, 0)
    assert.equal(shareAcrossSubdomains(siteStorage(), 'app', '.example.com').get('session-token'), null)
  })

  it("adopts a site's own device from before the option, and the cookie wins after", () => {
    const { document } = cookieJar()
    Object.defineProperty(globalThis, 'document', { value: document, configurable: true })

    const older = siteStorage()
    older.set('device-id', 'device-old')
    assert.equal(shareAcrossSubdomains(older, 'app', '.example.com').get('device-id'), 'device-old')

    const other = siteStorage()
    other.set('device-id', 'device-other')
    assert.equal(shareAcrossSubdomains(other, 'app', '.example.com').get('device-id'), 'device-old')
  })

  it('forgets a shared key everywhere when removed (logout)', () => {
    const { jar, document } = cookieJar()
    Object.defineProperty(globalThis, 'document', { value: document, configurable: true })

    const site = shareAcrossSubdomains(siteStorage(), 'app', '.example.com')
    site.set('device-id', 'device-1')
    site.remove('device-id')
    assert.equal(jar.size, 0)
    assert.equal(site.get('device-id'), null)
  })

  it("writes the shared device into the site's own store, for a copy of the SDK without the option", () => {
    const { document } = cookieJar()
    Object.defineProperty(globalThis, 'document', { value: document, configurable: true })

    shareAcrossSubdomains(siteStorage(), 'app', '.example.com').set('device-id', 'device-1')
    // The product had its own device from an earlier visit; its widget reads the local store.
    const product = siteStorage()
    product.set('device-id', 'device-old')
    shareAcrossSubdomains(product, 'app', '.example.com').get('device-id')
    assert.equal(product.map.get('device-id'), 'device-1')
  })
})
