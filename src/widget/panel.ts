/**
 * The script inside the iframe (ADR-0046 §3, amended 2026-09-23).
 *
 * This is the messenger's own document: it owns the session, the API calls and
 * the live socket, and it is the only side that ever talks to the server. The
 * host page gets told two things through `postMessage` - that the widget is
 * ready, in which colours, and how many threads are unread - and can ask for
 * three: open, close, identify.
 *
 * The frame is same-origin with the host page: the loader writes its document
 * as `srcdoc`, so the API calls made from here carry the studio's own origin
 * and the declared-origins list (§5) applies. The configuration therefore comes
 * from `data-` attributes on this script's tag, not from a query string, and
 * the stylesheet is bundled here and injected at boot: a same-origin document
 * has no URL of its own to fetch anything from.
 *
 * What is here is the boot and the bridge. The screens are Preact, under
 * `ui/`, and they read nothing this file does not hand them.
 */

import { createElement, render } from 'preact'

import { createAppwin, type Appwin } from '../index.ts'
import panelCss from './panel.css'
import { panelMessage, readHostMessage } from './protocol.ts'
import { widgetStrings } from './strings.ts'
import { App } from './ui/app.tsx'
import { WidgetStore } from './ui/store.ts'
import { applyTheme } from './ui/theme.ts'

/** How long a failed boot waits before trying again, and the cap it climbs to. */
const RETRY_BASE_MS = 2_000
const RETRY_MAX_MS = 60_000

interface PanelParams {
  appId: string
  hostOrigin: string
  apiUrl: string | null
  gatewayUrl: string | null
  userId: string | null
}

/**
 * Reads the configuration off this script's own tag, as the loader wrote it
 * into the `srcdoc` (and as the loader reads its own snippet). Only valid while
 * the script body runs, hence at load time and never lazily.
 */
function readParams(): PanelParams | null {
  const script = document.currentScript as HTMLScriptElement | null
  if (!script) return null
  const appId = script.getAttribute('data-app-id')
  const host = script.getAttribute('data-host-origin')
  if (!appId || !host) return null

  // The host origin decides who we answer, so anything that is not an origin
  // is a snippet someone has been editing: refuse rather than post to `*`.
  let hostOrigin: string
  try {
    hostOrigin = new URL(host).origin
  } catch {
    return null
  }
  if (hostOrigin === 'null') return null

  return {
    appId,
    hostOrigin,
    apiUrl: script.getAttribute('data-api-url'),
    gatewayUrl: script.getAttribute('data-gateway-url'),
    userId: script.getAttribute('data-user-id'),
  }
}

/**
 * First thing, before anything renders: a same-origin `srcdoc` document has no
 * `<link>` to a stylesheet of its own, and the root stays hidden by this very
 * stylesheet until the configuration is in, so there is no unstyled flash.
 */
function injectStyles(): void {
  const style = document.createElement('style')
  style.textContent = panelCss
  document.head.appendChild(style)
}

function boot(params: PanelParams): void {
  const locale = navigator.language || 'en'
  const strings = widgetStrings(locale)
  const toHost = (message: ReturnType<typeof panelMessage>): void => {
    parent.postMessage(message, params.hostOrigin)
  }

  const appwin: Appwin = createAppwin({
    appId: params.appId,
    ...(params.userId ? { userId: params.userId } : {}),
    ...(params.apiUrl ? { apiUrl: params.apiUrl } : {}),
    ...(params.gatewayUrl ? { gatewayUrl: params.gatewayUrl } : {}),
  })

  const store = new WidgetStore({ client: appwin.support })
  const root = document.getElementById('root')
  if (!root) return

  render(
    createElement(App, {
      store,
      strings,
      locale,
      onClose: () => toHost(panelMessage({ type: 'close' })),
    }),
    root,
  )

  // Escape belongs to the frame that has focus, so the host page never sees it
  // while the visitor is typing in here.
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') toHost(panelMessage({ type: 'close' }))
  })

  window.addEventListener('message', (event: MessageEvent) => {
    if (event.origin !== params.hostOrigin) return
    const message = readHostMessage(event.data)
    if (!message) return

    switch (message.type) {
      case 'open':
        // Reopened after a while: whatever arrived in between is fetched now
        // rather than waited for.
        void store.refreshConversations()
        break
      case 'close':
        break
      case 'identify':
        void appwin.identify(message.userId)
        break
      case 'reset':
        appwin.reset()
        break
    }
  })

  let unread = -1
  store.subscribe(() => {
    if (store.unread === unread) return
    unread = store.unread
    toHost(panelMessage({ type: 'unread', count: unread }))
  })

  let attempts = 0
  const start = async (): Promise<void> => {
    await store.boot()
    const config = store.getState().config
    if (!config) {
      // Never `ready`, so the launcher stays hidden: a studio's page must not
      // grow a support bubble that opens onto an error. The visitor sees
      // nothing at all, which is the honest failure here.
      const delay = Math.min(RETRY_BASE_MS * 2 ** attempts, RETRY_MAX_MS)
      attempts += 1
      setTimeout(() => void start(), delay)
      return
    }

    attempts = 0
    applyTheme(config, document.documentElement)
    document.body.dataset.state = 'ready'
    toHost(
      panelMessage({
        type: 'ready',
        primary: config.colors.primary,
        primaryForeground: config.colors.primaryForeground,
      }),
    )

    appwin.connect(
      (event) => store.onRealtime(event),
      (connected) => {
        // A gap in the socket is a gap in what we know: the list is refetched
        // on reconnection rather than trusted.
        if (connected) void store.refreshConversations()
      },
    )
  }

  void start()
}

const params = readParams()
if (params) {
  injectStyles()
  boot(params)
}
