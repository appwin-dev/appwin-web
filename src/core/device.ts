import type { AppwinStorage } from './storage.ts'

const DEVICE_ID_KEY = 'device-id'

/** What the server stores on `devices` for a browser visitor. */
export interface DeviceInfo {
  deviceId: string
  platform: 'web'
  /** Browser name and version, best effort. Shown to the agent in the inbox. */
  model?: string
  /** Operating system, best effort. */
  os?: string
  /** Page language, used to pick the customer's language when unknown. */
  language?: string
}

function randomId(): string {
  // `crypto.randomUUID` needs a secure context, which a support widget always
  // has in practice, but a studio on plain http in development does not.
  try {
    return globalThis.crypto.randomUUID()
  } catch {
    // Not cryptographic, and it does not need to be: this identifies a browser
    // to itself, it authorises nothing. The bearer token does that.
    const rand = () => Math.floor(Math.random() * 0x10000).toString(16).padStart(4, '0')
    return `${rand()}${rand()}-${rand()}-4${rand().slice(1)}-a${rand().slice(1)}-${rand()}${rand()}${rand()}`
  }
}

/**
 * Stable id for this browser, created once and kept.
 *
 * Clearing site data loses it, and with it the thread: the visitor comes back
 * as someone new. That is the same deal as reinstalling a mobile app, and it
 * is the price of not asking an anonymous visitor to sign in.
 */
export function resolveDeviceId(storage: AppwinStorage): string {
  const existing = storage.get(DEVICE_ID_KEY)
  if (existing) return existing

  const created = randomId()
  storage.set(DEVICE_ID_KEY, created)
  return created
}

/**
 * Reads what the browser will say about itself.
 *
 * Deliberately shallow: no fingerprinting, no library, no feature probing. The
 * agent wants to know roughly what the visitor is on so they can give the right
 * instructions, and the user agent string answers that. Anything more would be
 * tracking we would then have to justify.
 */
export function readDeviceInfo(storage: AppwinStorage): DeviceInfo {
  const nav: { userAgent?: string; language?: string } =
    (globalThis as { navigator?: { userAgent?: string; language?: string } }).navigator ?? {}

  const info: DeviceInfo = {
    deviceId: resolveDeviceId(storage),
    platform: 'web',
  }

  const browser = parseBrowser(nav.userAgent)
  if (browser) info.model = browser
  const os = parseOs(nav.userAgent)
  if (os) info.os = os
  if (nav.language) info.language = nav.language

  return info
}

/** Browser family and major version, or undefined when we cannot tell. */
function parseBrowser(userAgent: string | undefined): string | undefined {
  if (!userAgent) return undefined
  // Order matters: Edge and Chrome both claim Safari, Chrome claims Safari.
  const patterns: Array<[string, RegExp]> = [
    ['Edge', /Edg\/(\d+)/],
    ['Opera', /OPR\/(\d+)/],
    ['Chrome', /Chrome\/(\d+)/],
    ['Firefox', /Firefox\/(\d+)/],
    ['Safari', /Version\/(\d+).*Safari/],
  ]
  for (const [name, pattern] of patterns) {
    const match = pattern.exec(userAgent)
    if (match) return `${name} ${match[1]}`
  }
  return undefined
}

function parseOs(userAgent: string | undefined): string | undefined {
  if (!userAgent) return undefined
  if (/Windows NT 10/.test(userAgent)) return 'Windows 10+'
  if (/Windows/.test(userAgent)) return 'Windows'
  if (/Android/.test(userAgent)) return 'Android'
  // iPadOS reports as Macintosh, so the touch check is what separates them.
  if (/iPhone|iPad|iPod/.test(userAgent)) return 'iOS'
  if (/Mac OS X/.test(userAgent)) return 'macOS'
  if (/Linux/.test(userAgent)) return 'Linux'
  return undefined
}
