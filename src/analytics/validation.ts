import type { AnalyticsProps } from './types.ts'

/** Mirrors the server contract: an invalid event is only counted in `rejected`, which nobody sees. */
const EVENT_NAME = /^[a-z][a-z0-9_]{0,63}$/

const RESERVED_NAMES = new Set([
  'session_start',
  'session_end',
  'screen_view',
  'app_install',
  'app_update',
  'install_referrer',
])

const MAX_PROPS = 20
const MAX_KEY_LENGTH = 64
const MAX_STRING_LENGTH = 256
const MAX_SCREEN_LENGTH = 128

export function isCustomEventName(name: string): boolean {
  return EVENT_NAME.test(name) && !RESERVED_NAMES.has(name)
}

export function sanitizeScreen(screen: string): string {
  return screen.slice(0, MAX_SCREEN_LENGTH)
}

/**
 * Keeps scalar values only, since plain-JS callers can pass anything. Keys are
 * taken in alphabetical order so the ones dropped past the cap are always the same.
 */
export function sanitizeProps(props: AnalyticsProps | undefined): AnalyticsProps | undefined {
  if (!props) return undefined

  const out: AnalyticsProps = {}
  let count = 0
  for (const key of Object.keys(props).sort()) {
    if (count >= MAX_PROPS) break
    if (!key || key.length > MAX_KEY_LENGTH) continue

    const value: unknown = props[key]
    if (typeof value === 'string') out[key] = value.slice(0, MAX_STRING_LENGTH)
    else if (typeof value === 'boolean') out[key] = value
    else if (typeof value === 'number' && Number.isFinite(value)) out[key] = value
    else continue
    count += 1
  }
  return count > 0 ? out : undefined
}
