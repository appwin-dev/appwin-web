import type { AppwinUserAttributes } from '../core/session.ts'

/**
 * The `postMessage` dialogue between the host page and the panel iframe.
 *
 * The iframe is what keeps the studio's CSS out of the messenger and ours out
 * of their page (ADR-0046 §3), and this file is the price of that frontier:
 * two documents on two origins that can only talk in strings. Both sides parse
 * through the readers below and act on nothing else, because anything on a
 * page can post to a window and a widget that trusts what it is told is a
 * widget anyone can drive.
 *
 * Shared by both bundles on purpose: a message the loader sends and the panel
 * does not understand is then a type error rather than a silence to debug.
 */

/** Bumped when a message changes shape. Old loaders stay cached on studio pages. */
export const WIDGET_PROTOCOL_VERSION = 2

/**
 * Still read, never sent. The snippet points at the mutable `cdn.appwin.io/v1/`
 * and the loader is cached up to a week (stale-while-revalidate), so a 0.7
 * loader meets a 0.8 panel on sites that never upgraded anything. v1 differs
 * only in `identify.userId` and `reset`, mapped below.
 */
const LEGACY_PROTOCOL_VERSION = 1

const HOST = 'appwin-host'
const PANEL = 'appwin-panel'

/** Host page to panel. */
export type HostMessage =
  | { v: 2; from: typeof HOST; type: 'open' }
  | { v: 2; from: typeof HOST; type: 'close' }
  | { v: 2; from: typeof HOST; type: 'identify'; externalId: string; attributes?: AppwinUserAttributes }
  | { v: 2; from: typeof HOST; type: 'updateUser'; attributes: AppwinUserAttributes }
  | { v: 2; from: typeof HOST; type: 'logout' }

/** Panel to host page. */
export type PanelMessage =
  /** Config is in: the panel can be shown, and the launcher knows its colours. */
  | { v: 2; from: typeof PANEL; type: 'ready'; primary: string; primaryForeground: string }
  | { v: 2; from: typeof PANEL; type: 'unread'; count: number }
  /** The panel's own close button, so the launcher returns to its idle state. */
  | { v: 2; from: typeof PANEL; type: 'close' }

/**
 * A message without its envelope.
 *
 * Distributive on purpose: a plain `Omit` over a union collapses it into one
 * object with every field optional, and `identify` would then typecheck
 * without its `externalId`.
 */
type Payload<T> = T extends unknown ? Omit<T, 'v' | 'from'> : never

export function hostMessage(message: Payload<HostMessage>): HostMessage {
  return { v: WIDGET_PROTOCOL_VERSION, from: HOST, ...message } as HostMessage
}

export function panelMessage(message: Payload<PanelMessage>): PanelMessage {
  return { v: WIDGET_PROTOCOL_VERSION, from: PANEL, ...message } as PanelMessage
}

function envelope(raw: unknown, from: string): Record<string, unknown> | null {
  if (typeof raw !== 'object' || raw === null) return null
  const message = raw as Record<string, unknown>
  // A page hosting the widget also hosts its own framework's postMessage
  // traffic, and every bundler's dev server adds more: anything not addressed
  // to us is simply not ours to read.
  if (message.from !== from) return null
  if (message.v !== WIDGET_PROTOCOL_VERSION && message.v !== LEGACY_PROTOCOL_VERSION) return null
  return message
}

export function readHostMessage(raw: unknown): HostMessage | null {
  const message = envelope(raw, HOST)
  if (!message) return null
  if (message.v === LEGACY_PROTOCOL_VERSION) return readLegacyHostMessage(message)

  switch (message.type) {
    case 'open':
    case 'close':
    case 'logout':
      return hostMessage({ type: message.type })
    case 'identify': {
      if (typeof message.externalId !== 'string' || !message.externalId) return null
      if (message.attributes === undefined) {
        return hostMessage({ type: 'identify', externalId: message.externalId })
      }
      const attributes = readAttributes(message.attributes)
      if (!attributes) return null
      return hostMessage({ type: 'identify', externalId: message.externalId, attributes })
    }
    case 'updateUser': {
      const attributes = readAttributes(message.attributes)
      if (!attributes) return null
      return hostMessage({ type: 'updateUser', attributes })
    }
    default:
      return null
  }
}

function readLegacyHostMessage(message: Record<string, unknown>): HostMessage | null {
  switch (message.type) {
    case 'open':
    case 'close':
      return hostMessage({ type: message.type })
    case 'reset':
      return hostMessage({ type: 'logout' })
    case 'identify':
      if (typeof message.userId !== 'string' || !message.userId) return null
      return hostMessage({ type: 'identify', externalId: message.userId })
    default:
      return null
  }
}

const TRAIT_KEYS = ['email', 'name', 'avatarUrl', 'language', 'timezone', 'location', 'plan'] as const

/** Known string fields only: anything else in the object is dropped, a wrong type refuses it all. */
function readAttributes(raw: unknown): AppwinUserAttributes | null {
  if (typeof raw !== 'object' || raw === null) return null
  const source = raw as Record<string, unknown>
  const attributes: AppwinUserAttributes = {}
  for (const key of TRAIT_KEYS) {
    const value = source[key]
    if (value === undefined) continue
    if (typeof value !== 'string') return null
    attributes[key] = value
  }
  return attributes
}

export function readPanelMessage(raw: unknown): PanelMessage | null {
  const message = envelope(raw, PANEL)
  if (!message) return null

  switch (message.type) {
    case 'ready':
      if (typeof message.primary !== 'string' || typeof message.primaryForeground !== 'string') {
        return null
      }
      return panelMessage({
        type: 'ready',
        primary: message.primary,
        primaryForeground: message.primaryForeground,
      })
    case 'unread':
      if (typeof message.count !== 'number' || !Number.isFinite(message.count)) return null
      return panelMessage({ type: 'unread', count: Math.max(0, Math.trunc(message.count)) })
    case 'close':
      return panelMessage({ type: 'close' })
    default:
      return null
  }
}
