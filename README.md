# @appwin/web

Appwin Support on the web: the same messenger as the iOS, Android and Flutter
SDKs, embeddable on any site.

Status: **the messenger works.** Launcher, iframe panel, Home, help centre,
thread list and conversation, live updates. What is not in yet: the six preset
banner artworks, and message editing, deletion and reactions (the headless
layer exposes all three).

## Install

Two ways in, and the snippet is the one studios use (ADR-0046 §2):

```html
<script src="https://cdn.appwin.io/v1/appwin.js" data-appwin-app-id="your-app-id"></script>
```

```bash
npm install @appwin/web   # for a team that bundles, or wants the headless layer
```

`/v1/` follows the latest release. To pin, replace it with a version:
`https://cdn.appwin.io/0.7.0/appwin.js` never changes.

### The snippet's options

Everything is read off the tag, so there is nothing to call:

| Attribute | |
| --- | --- |
| `data-appwin-app-id` | **required**, from dashboard → your app → SDK |
| `data-appwin-user-id` | your own id for a signed-in user; absent means an anonymous visitor |
| `data-appwin-api-url` | self-hosted or staging setups |
| `data-appwin-gateway-url` | idem, for the live socket |
| `data-appwin-panel-url` | the panel script; defaults to `panel.js` next to the loader |

The page can also drive the widget once it is up:

```js
Appwin.open()
Appwin.close()
Appwin.toggle()
Appwin.identify('user-123')  // when your own user signs in
Appwin.reset()               // and when they sign out
```

The launcher only appears once the messenger has its configuration, so a page
whose API call fails grows no support bubble at all rather than one that opens
onto an error.

### Content Security Policy

The panel runs in an iframe that shares your page's origin, so your CSP applies
inside it. A strict policy needs:

```
script-src  https://cdn.appwin.io
style-src   'unsafe-inline'
connect-src https://api.appwin.io wss://ws.appwin.io
img-src     https://appwin-uploads-prod.s3.fr-par.scw.cloud
```

`style-src 'unsafe-inline'` because both the launcher and the panel inject
their stylesheet; `img-src` for avatars and attachments.

## Use

```ts
import { createAppwin } from '@appwin/web'

const appwin = createAppwin({
  appId: 'your-app-id',      // dashboard → your app → SDK
  userId: currentUser?.id,   // optional: a visitor may stay anonymous
})

const config = await appwin.support.config()
const { data: threads } = await appwin.support.conversations()

const thread = await appwin.support.createConversation({ body: 'Hello!' })
await appwin.support.sendMessage(thread.id, { body: 'Anyone there?' })

// Live updates. Events say what changed, never the content, so refetch on one.
const realtime = appwin.connect((event) => {
  if (event.type === 'message') void refreshThreads()
})
```

## Before it will work

The web channel is closed until the studio declares where the SDK may run:
**dashboard → the app → SDK → Web domains**. Without it every call answers 403
with `code: 'origin_not_allowed'`. That is what stops someone lifting an App ID
out of a page's source and pointing it at your inbox. `localhost` always
works, so integrating locally needs no setup.

## Notes

- **No runtime dependencies for the library.** `fetch`, `WebSocket`, `crypto`
  and `localStorage` are all `@appwin/web` needs; a studio importing it carries
  no transitive tree of ours. The widget's screens are Preact, bundled into
  `panel.js` alone, which is why it is a dev dependency here.
- **Sizes**, gzipped, which is the number that matters on a studio's page:
  ~2.7 kB for the loader, ~23 kB for the panel with its stylesheet. Intercom
  is around 500 kB and Crisp around 250.
- **Headless core.** `src/core` and `src/support` never touch the DOM
  (ADR-0036 §4): they run in a test or a worker, and a studio that wants its
  own interface uses them and nothing else. The widget is only their first
  consumer, and reaches nothing they do not expose.
- **The messenger lives in an iframe on your page's own origin.** The loader
  writes the frame's document itself (`srcdoc`) and that document pulls
  `panel.js` from the CDN. The frame is what keeps your CSS out of the
  messenger and ours out of your page; its origin is what makes every API
  call carry *your* domain, so the declared-origins list applies. The two
  sides speak through a checked `postMessage` protocol
  (`src/widget/protocol.ts`); the launcher sits in a closed shadow root, which
  is what spares it your `!important` without one of our own.
- **Anonymous visitors persist in `localStorage`**, on your site's origin.
  Clearing site data loses the thread and the visitor comes back as someone
  new, the same deal as reinstalling a mobile app.
- **Types are hand-written**, not imported from the backend's contracts
  package, which carries Zod and describes the whole API. ADR-0036 §5 has them
  generated from an OpenAPI spec in the end; `src/support/types.ts` is what
  that will replace.

## Development

```bash
npm run typecheck
npm test          # node's built-in runner, no framework
npm run build     # tsup → dist/ (library, loader, panel)
```

Trying the widget on a real page, against the local stack:

```bash
npm run build
node ../examples/sandbox-web/serve.mjs               # served root is sdk/
open http://localhost:5174/examples/sandbox-web/
```

That server exists for one header, `Cache-Control: no-store`: `python3 -m
http.server` sends none, and a browser then keeps serving the build from ten
minutes ago.

`sdk/examples/sandbox-web/` is a deliberately hostile host page: it overrides
`button` and `iframe` in `!important`, which is what a studio's reset does to a
widget injected into their DOM. `?loader=https://cdn.staging.appwin.io/v1/appwin.js`
points it at the real CDN path.

Tests run on the TypeScript sources directly through Node's type stripping,
which is why the source avoids constructor parameter properties: strip-only
mode cannot emit the assignment they imply.

## Release

`pnpm sdk:release --push` from the monorepo mirrors this folder to
`appwin-dev/appwin-web` and tags it; the tag runs `publish.yml` there, which
publishes to npm (OIDC, no secret) and uploads `appwin.js` and `panel.js` to
the CDN under `v1/` and `<version>/` (repository secrets `CDN_ACCESS_KEY_ID`
and `CDN_SECRET_ACCESS_KEY`, the `appwin-cdn-publish-prod` application from
appwin-infra).
