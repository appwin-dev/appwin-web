import { Session } from './core/session.ts'
import { createStorage } from './core/storage.ts'
import { SupportClient } from './support/client.ts'
import { SupportRealtime, type SupportRealtimeEvent } from './support/realtime.ts'

export { AppwinError, type AppwinErrorCode } from './core/errors.ts'
export type { SupportClient, SendMessageInput } from './support/client.ts'
export type { SupportRealtime, SupportRealtimeEvent } from './support/realtime.ts'
export type * from './support/types.ts'

/** Kept in step with the other artefacts by `sdk/scripts/release.mjs`. */
export const SDK_VERSION = '0.7.0'

const DEFAULT_API_URL = 'https://api.appwin.io'
const DEFAULT_GATEWAY_URL = 'wss://ws.appwin.io'

export interface AppwinOptions {
  /** The App ID of the project, from the dashboard's SDK tab. */
  appId: string
  /**
   * Your own user's id, when they are signed in. Optional: an anonymous
   * visitor is a perfectly good customer, they just come back as a lead.
   */
  userId?: string
  /** Override for self-hosted or staging setups. */
  apiUrl?: string
  gatewayUrl?: string
}

/**
 * Appwin Support, headless.
 *
 * This is the whole product without any interface, which is the layer the
 * widget is built on and the layer a studio uses when it wants its own
 * (ADR-0036 §4). Nothing here touches the DOM, so it runs in a worker, in a
 * test, or server side just as well as in a page.
 *
 * ```ts
 * const appwin = createAppwin({ appId: 'aaaa-...' })
 * const config = await appwin.support.config()
 * const { data } = await appwin.support.conversations()
 * ```
 */
export interface Appwin {
  support: SupportClient
  /**
   * Opens the live connection. Optional: every read works over REST without
   * it, and it is what a page that only shows an unread badge can skip.
   */
  connect(
    onEvent: (event: SupportRealtimeEvent) => void,
    onConnectionChange?: (connected: boolean) => void,
  ): SupportRealtime
  /** Attaches this browser to one of your users. Safe to call on every page. */
  identify(userId: string): Promise<void>
  /** Forgets the visitor. Call it when your own user signs out. */
  reset(): void
}

export function createAppwin(options: AppwinOptions): Appwin {
  if (!options.appId) {
    throw new Error('[appwin] `appId` is required. Find it in the dashboard, SDK tab.')
  }

  const apiUrl = stripTrailingSlash(options.apiUrl ?? DEFAULT_API_URL)
  const gatewayUrl = stripTrailingSlash(options.gatewayUrl ?? DEFAULT_GATEWAY_URL)

  const storage = createStorage(options.appId)
  const session = new Session({
    appId: options.appId,
    baseUrl: apiUrl,
    storage,
    sdkVersion: SDK_VERSION,
  })

  // Identity is attached in the background: making `createAppwin` async would
  // force every host page to await before it can even render a launcher.
  if (options.userId) void session.identify(options.userId)

  const support = new SupportClient(session)

  return {
    support,
    connect(onEvent, onConnectionChange) {
      const realtime = new SupportRealtime({
        session,
        gatewayUrl,
        onEvent,
        ...(onConnectionChange ? { onConnectionChange } : {}),
      })
      void realtime.connect()
      return realtime
    },
    identify: (userId) => session.identify(userId),
    reset: () => session.reset(),
  }
}

function stripTrailingSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url
}
