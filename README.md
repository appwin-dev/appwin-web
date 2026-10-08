# @appwin/web

Appwin Support and Analytics on the web: the same messenger as the iOS, Android
and Flutter SDKs, embeddable on any site, and the same behavioral events.

Full guide, API and dashboard setup: https://appwin.io/docs/sdk/installation

> ## ⚠️ Before anything works: declare your domains
>
> The web channel is **closed until you list the sites allowed to use your App ID**:
>
> **Appwin dashboard → your app → SDK tab → Web domains**
>
> Until then, every call is refused with `403` and `code: 'origin_not_allowed'`,
> and nothing loads: no messenger, no analytics. This is what stops someone from
> copying your App ID out of a page's source and using it on their own site.
>
> Add each domain your site runs on: `myapp.com`, or `*.myapp.com` to cover
> subdomains and preview deploys.

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

This package exposes [Support](https://appwin.io/docs/products/support) (the
launcher, iframe panel, Home, help centre, thread list and conversation, with
live updates) and [Analytics](https://appwin.io/docs/products/analytics) (npm
only for now). The other Appwin products
([Community](https://appwin.io/docs/products/community),
[Notifications](https://appwin.io/docs/products/notifications),
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

## Analytics

```ts
const appwin = createAppwin({ appId: 'your-app-id', appVersion: '1.4.0' })

await appwin.analytics.initialize()          // page views are recorded from here on
appwin.analytics.track('signup_completed', { plan: 'pro' })
appwin.analytics.setConsent('unknown')       // from your consent banner, if you have one
```

Sessions and a `screen_view` per page (its path, never the query string) are
recorded on their own, single-page app navigations included. Pass
`initialize({ pageViews: false })` to call `screen()` yourself. Events are
queued per tab and uploaded every 30 s, after 20 events, and when the page is
hidden. Full guide: [Analytics](https://appwin.io/docs/products/analytics).

Uncaught errors and unhandled promise rejections are reported as crashes, with
their stack and the last 20 screens and event names before them (never props).
Report the errors your own code catches with `recordError`:

```ts
try {
  await checkout()
} catch (error) {
  appwin.analytics.recordError(error)        // { fatal: true } to count it as a crash
}
```

Reports follow the same consent as events. Pass
`initialize({ crashReporting: false })` if another tool already reports them.

### Session replay

Switched on per app in the dashboard (Analytics, Replays), with no code to
add: once it is on, a share of sessions (the sample rate you set) is recorded
with [rrweb](https://github.com/rrweb-io/rrweb) and uploaded every 10 seconds,
gzipped, for at most one hour per session. The recorder is a separate chunk,
downloaded only when a session is actually recorded: a site with replay off
does not load a byte of it.

Masking happens in the browser, before anything is sent. Form fields are
always masked; all text and all images are too, unless you turned that off in
the dashboard. Mark elements in your own markup to adjust:

```html
<p data-appwin-unmask>Shown as is, even with "mask all text" on</p>
<div data-appwin-mask>Recorded as an empty box, whatever the settings</div>
```

Fields stay masked inside `data-appwin-unmask`. The Appwin widget is never
recorded. Recording needs consent `granted` (`unknown` and `denied` record
nothing) and a browser with `CompressionStream`. To keep a site from ever
recording, whatever the dashboard says:

```ts
await appwin.analytics.initialize({ sessionReplay: false })
```

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

## Support

Bugs and questions: the issues of this repository. Anything tied to your
account, billing or data goes through the support widget in your Appwin
dashboard.

## Licence

Proprietary, see [LICENSE](./LICENSE). This source is public for auditability
and studio-side debugging, not for reuse.
