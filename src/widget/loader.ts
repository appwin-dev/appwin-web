/**
 * The script a studio pastes into its page (ADR-0046 §2).
 *
 * Everything it does is the launcher and the frame around the messenger: no
 * product logic, no network call of its own, nothing that has to be right for
 * the host page to keep working. That is deliberate. This file is served from
 * the CDN and cached on thousands of pages we do not control, so it is the one
 * piece of the SDK we cannot fix quickly, and the one that runs inside
 * somebody else's site.
 *
 * Both the launcher and the iframe live in a closed shadow root. The panel is
 * isolated by the iframe itself; the shadow root is what keeps the host's
 * `button { … !important }` off our launcher without a single `!important` of
 * our own.
 *
 * The panel iframe is same-origin with the host page (ADR-0046 §3, amended
 * 2026-09-23): its document is written here as `srcdoc`, and it pulls `panel.js`
 * from the CDN. It is NOT loaded cross-origin from the CDN, because a panel on
 * `cdn.appwin.io` sends `Origin: cdn.appwin.io` on every API call, the same for
 * every studio, and the declared-origins list (ADR-0046 §5) then never bites.
 * A same-origin panel sends the studio's own origin, which is the whole point.
 */

import { hostMessage, readPanelMessage } from './protocol.ts'
import { launcherStrings } from './launcher-strings.ts'

/** Above everything a page is likely to stack, and below the browser's own UI. */
const Z_INDEX = '2147483000'

/** Below this width the panel takes the whole screen, as a native app would. */
const FULLSCREEN_BREAKPOINT = 480

interface LoaderConfig {
  appId: string
  /** The panel script, served next to this loader on the CDN. */
  panelScriptUrl: string
  apiUrl: string | null
  gatewayUrl: string | null
  userId: string | null
}

export interface AppwinWidget {
  open(): void
  close(): void
  toggle(): void
  /** Attaches this browser to one of the studio's own users. */
  identify(userId: string): void
  /** Forgets the visitor, for when the studio's user signs out. */
  reset(): void
}

/**
 * Reads the snippet's own `<script>` tag.
 *
 * `document.currentScript` is only valid while the script body runs, which is
 * why this is called at load time and not lazily. The fallback covers the
 * studio who moved the tag into a bundle or a tag manager, where there is no
 * current script to speak of.
 */
function readConfig(): LoaderConfig | null {
  const script =
    (document.currentScript as HTMLScriptElement | null) ??
    document.querySelector<HTMLScriptElement>('script[data-appwin-app-id]')
  if (!script) return null

  const appId = script.getAttribute('data-appwin-app-id')
  if (!appId) return null

  // The panel script is served next to the loader, so one `src` configures both
  // and a studio on a pinned version stays coherent across the two files.
  const panelScriptUrl =
    script.getAttribute('data-appwin-panel-url') ??
    new URL('panel.js', script.src || location.href).toString()

  return {
    appId,
    panelScriptUrl,
    apiUrl: script.getAttribute('data-appwin-api-url'),
    gatewayUrl: script.getAttribute('data-appwin-gateway-url'),
    userId: script.getAttribute('data-appwin-user-id'),
  }
}

/** Escapes a string for an HTML double-quoted attribute value. */
function attr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

/**
 * The document that goes into the iframe.
 *
 * Written as `srcdoc` rather than pointed at a CDN URL, so the frame inherits
 * the host's origin (see the file header). The configuration rides as `data-`
 * attributes on the panel's own script tag, the way this loader reads its own:
 * it never lands in a URL, a referrer or a server log, which is what a `userId`
 * should never do. And it is not an inline script on purpose: a `srcdoc` frame
 * inherits the host page's CSP, and a studio with a strict `script-src` would
 * see an inline script blocked where the CDN script is already allowed.
 *
 * `panel.js` carries its own stylesheet and injects it at boot, so the head
 * here is bare.
 */
function panelDocument(config: LoaderConfig): string {
  const data = [
    ['data-app-id', config.appId],
    ['data-host-origin', location.origin],
    ['data-api-url', config.apiUrl],
    ['data-gateway-url', config.gatewayUrl],
    ['data-user-id', config.userId],
  ]
    .filter((entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1] !== '')
    .map(([name, value]) => ` ${name}="${attr(value)}"`)
    .join('')
  const lang = attr(document.documentElement.lang || 'en')
  return (
    `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">` +
    `<meta name="robots" content="noindex"><title>Appwin</title></head>` +
    `<body><div id="root"></div>` +
    `<script src="${attr(config.panelScriptUrl)}"${data}></script></body></html>`
  )
}

function styleSheet(): string {
  return `
    :host { all: initial; }
    button, iframe { box-sizing: border-box; }
    .launcher {
      position: fixed;
      right: 20px;
      bottom: 20px;
      width: 56px;
      height: 56px;
      padding: 0;
      border: 0;
      border-radius: 50%;
      background: #1f1f1f;
      color: #fff;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.24);
      display: none;
      align-items: center;
      justify-content: center;
      transition: transform 120ms ease, opacity 120ms ease;
    }
    .launcher[data-visible='true'] { display: flex; }
    .launcher:hover { transform: scale(1.05); }
    .launcher:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
    .launcher svg { width: 26px; height: 26px; display: block; }
    .launcher .close { display: none; }
    .launcher[data-open='true'] .open { display: none; }
    .launcher[data-open='true'] .close { display: block; }
    .badge {
      position: absolute;
      top: -2px;
      right: -2px;
      min-width: 20px;
      height: 20px;
      padding: 0 5px;
      border-radius: 10px;
      background: #ef4444;
      color: #fff;
      font: 600 12px/20px system-ui, sans-serif;
      display: none;
    }
    .badge[data-count]:not([data-count='0']) { display: block; }
    .panel {
      position: fixed;
      right: 20px;
      bottom: 88px;
      width: 400px;
      height: min(680px, calc(100vh - 120px));
      border: 0;
      border-radius: 16px;
      box-shadow: 0 8px 40px rgba(0, 0, 0, 0.18);
      background: #fff;
      /* "display: none" still loads the document, so the panel boots and
         fetches its config while the page is untouched. The launcher only
         appears once that config is in, in the studio's own colours. */
      display: none;
    }
    .panel[data-open='true'] { display: block; }
    @media (max-width: ${FULLSCREEN_BREAKPOINT}px) {
      .panel[data-open='true'] {
        inset: 0;
        width: 100%;
        height: 100%;
        border-radius: 0;
      }
      .launcher[data-open='true'] { display: none; }
    }
    @media (prefers-reduced-motion: reduce) {
      .launcher { transition: none; }
    }
  `
}

/** Chat bubble and close cross, inline so the launcher needs no network of its own. */
function launcherIcons(): string {
  return `
    <svg class="open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 21l1.9-5.2A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z" />
    </svg>
    <svg class="close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  `
}

function mount(config: LoaderConfig): AppwinWidget {
  const strings = launcherStrings(document.documentElement.lang || navigator.language)

  const host = document.createElement('div')
  // The host element carries nothing but the stacking context: everything
  // visible lives in the shadow root, out of reach of the page's stylesheet.
  host.style.setProperty('position', 'relative', 'important')
  host.style.setProperty('z-index', Z_INDEX, 'important')
  document.body.appendChild(host)

  const root = host.attachShadow({ mode: 'closed' })
  const style = document.createElement('style')
  style.textContent = styleSheet()

  const launcher = document.createElement('button')
  launcher.className = 'launcher'
  launcher.type = 'button'
  launcher.setAttribute('aria-label', strings.openMessenger)
  launcher.innerHTML = `${launcherIcons()}<span class="badge" data-count="0"></span>`
  const badge = launcher.querySelector('.badge') as HTMLSpanElement

  const panel = document.createElement('iframe')
  panel.className = 'panel'
  panel.title = strings.messenger
  // `allow-same-origin` is what keeps the frame on the HOST's origin (a
  // `srcdoc` frame inherits its embedder's), which is the whole point: the
  // panel's API calls then carry the studio's origin, the declared-origins
  // list bites, and the session lives in the studio site's own `localStorage`.
  // Dropping it would hand the frame an opaque origin, send `Origin: null`, and
  // close the channel. What the sandbox still buys: the panel cannot navigate
  // the host page away.
  panel.setAttribute(
    'sandbox',
    'allow-scripts allow-same-origin allow-forms allow-popups allow-downloads',
  )
  panel.srcdoc = panelDocument(config)

  root.append(style, launcher, panel)

  // The panel is same-origin now, so this is the host's own origin. The
  // `event.source` check below is what still tells the panel apart from any
  // other same-origin frame on the page.
  const panelOrigin = location.origin
  let isOpen = false

  const post = (message: ReturnType<typeof hostMessage>): void => {
    panel.contentWindow?.postMessage(message, panelOrigin)
  }

  const setOpen = (next: boolean): void => {
    if (isOpen === next) return
    isOpen = next
    panel.dataset.open = String(next)
    launcher.dataset.open = String(next)
    launcher.setAttribute('aria-label', next ? strings.closeMessenger : strings.openMessenger)
    post(hostMessage({ type: next ? 'open' : 'close' }))
    if (next) panel.focus()
  }

  launcher.addEventListener('click', () => setOpen(!isOpen))

  window.addEventListener('message', (event: MessageEvent) => {
    // Both checks are needed: the origin alone would let any same-origin frame
    // speak for the panel, and the source alone would trust a panel that has
    // navigated somewhere else.
    if (event.origin !== panelOrigin || event.source !== panel.contentWindow) return

    const message = readPanelMessage(event.data)
    if (!message) return

    switch (message.type) {
      case 'ready':
        launcher.style.background = message.primary
        launcher.style.color = message.primaryForeground
        launcher.dataset.visible = 'true'
        break
      case 'unread':
        badge.dataset.count = String(message.count)
        badge.textContent = message.count > 9 ? '9+' : String(message.count)
        break
      case 'close':
        setOpen(false)
        break
    }
  })

  return {
    open: () => setOpen(true),
    close: () => setOpen(false),
    toggle: () => setOpen(!isOpen),
    identify: (userId: string) => post(hostMessage({ type: 'identify', userId })),
    reset: () => post(hostMessage({ type: 'reset' })),
  }
}

const config = readConfig()
if (config) {
  const start = (): void => {
    const widget = mount(config)
    ;(window as { Appwin?: AppwinWidget }).Appwin = widget
  }
  // A studio pasting the snippet in `<head>` has no `<body>` to append to yet.
  if (document.body) start()
  else document.addEventListener('DOMContentLoaded', start, { once: true })
} else if (typeof console !== 'undefined') {
  // The one thing worth saying out loud: everything else fails visibly.
  console.warn('[appwin] missing `data-appwin-app-id` on the script tag, widget not started.')
}
