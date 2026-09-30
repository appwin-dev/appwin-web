# @appwin/web

Appwin Support on the web: the same messenger as the iOS, Android and Flutter
SDKs, embeddable on any site.

Full guide, API and dashboard setup: https://appwin.io/docs/sdk/installation

## Install

Drop-in snippet (what studios use), or npm for a bundler and the headless layer:

```html
<script src="https://cdn.appwin.io/v1/appwin.js" data-appwin-app-id="your-app-id"></script>
```

```bash
npm install @appwin/web
```

`/v1/` follows the latest release. To pin, use a version:
`https://cdn.appwin.io/0.7.0/appwin.js`.

## Products

This package exposes [Support](https://appwin.io/docs/products/support) only:
the launcher, iframe panel, Home, help centre, thread list and conversation,
with live updates. The other Appwin products
([Core](https://appwin.io/docs/products/appwin-core),
[Community](https://appwin.io/docs/products/community),
[Notifications](https://appwin.io/docs/products/notifications),
[Analytics](https://appwin.io/docs/products/analytics),
[Attribution](https://appwin.io/docs/products/attribution)) ship in the mobile
SDKs, not here.

## Quickstart

The snippet reads everything off the tag, so there is nothing to call. It can
still be driven once it is up:

```js
Appwin.open()
Appwin.close()
Appwin.toggle()
Appwin.identify('user-123', { email: 'ada@example.com' })  // when your user signs in
Appwin.updateUser({ plan: 'pro' })                         // omitted fields left as they are
Appwin.logout()                                            // and when they sign out
```

With the npm package (bundler or headless), create the client yourself:

```ts
import { createAppwin } from '@appwin/web'

const appwin = createAppwin({
  appId: 'your-app-id',         // dashboard, your app, SDK
  externalId: currentUser?.id,  // optional: a visitor may stay anonymous
})

await appwin.identify('user-123', { email: 'ada@example.com', name: 'Ada' })
await appwin.updateUser({ plan: 'pro' })

const config = await appwin.support.config()
const { data: threads } = await appwin.support.conversations()
const thread = await appwin.support.createConversation({ body: 'Hello!' })
await appwin.support.sendMessage(thread.id, { body: 'Anyone there?' })

// Live updates. Events say what changed, never the content, so refetch on one.
const realtime = appwin.connect((event) => {
  if (event.type === 'message') void refreshThreads()
})
```

See the [Quickstart](https://appwin.io/docs/sdk/installation).

## Snippet options

Set on the `<script>` tag:

| Attribute | |
| --- | --- |
| `data-appwin-app-id` | **required**, from dashboard, your app, SDK |
| `data-appwin-external-id` | your id for a signed-in user; absent means anonymous |
| `data-appwin-api-url` | self-hosted or staging setups |
| `data-appwin-gateway-url` | idem, for the live socket |
| `data-appwin-panel-url` | the panel script; defaults to `panel.js` next to the loader |

## Content Security Policy

The panel runs in an iframe on your page's origin, so your CSP applies inside
it. A strict policy needs:

```
script-src  https://cdn.appwin.io
style-src   'unsafe-inline'
connect-src https://api.appwin.io wss://ws.appwin.io
img-src     https://appwin-uploads-prod.s3.fr-par.scw.cloud
```

`style-src 'unsafe-inline'` because the launcher and panel inject their
stylesheet; `img-src` for avatars and attachments.

## Before it will work

The web channel is closed until the studio declares where the SDK may run:
**dashboard, the app, SDK, Web domains**. Without it every call answers 403 with
`code: 'origin_not_allowed'`, which is what stops someone lifting an App ID out
of a page's source. `localhost` always works, so integrating locally needs no
setup.

## Support

Bugs and questions: the issues of this repository. Anything tied to your
account, billing or data goes through the support widget in your Appwin
dashboard.

## Licence

Proprietary, see [LICENSE](./LICENSE). This source is public for auditability
and studio-side debugging, not for reuse.
