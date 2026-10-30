# Changelog - @appwin/web

Versions follow [semantic versioning](https://semver.org).

Each Appwin artefact versions independently: a fix here does not move the iOS,
Android, Flutter or React Native SDK. The number lives in `version.json` in the
monorepo, and the release script stamps `package.json` and the SDK version
from it.

## 1.2.0

**A paused Grow subscription no longer takes the widget away.** The support widget keeps its launcher while the organisation's subscription is paused and shows an « on hold » screen with the text the API serves. `appwin.support.pause()` resolves to the pause (`SupportPause`: `since`, `title`, `message`), or `null`. New method and type, no breaking change.

**`cookieDomain`: the shared device also in the site's own store.** A second copy of the SDK on the page without the option (a support widget's script tag) reads the same device and session as the one that has it.

## 1.1.0

**`cookieDomain`: one visit across your subdomains.** `createAppwin({ appId, cookieDomain: '.example.com' })` keeps the device, the current session, its replay state and the consent answers in first-party cookies on the parent domain, so a visit from `www.` to `app.` is one session and one replay. Unset, nothing changes. New option, no breaking change.

## 1.0.0

**Stable release.** The public API is stable from now on and follows semantic versioning: no breaking change before 2.0.0. The symbols deprecated during 0.x keep compiling and working through 1.x.

No API change since 0.14.0.

## 0.14.0

**`appwin.track` and consent per purpose, sessions from `createAppwin`.**

- `appwin.track('purchase', { plan: 'pro' })` is the one way to describe what happened, at the root of `createAppwin`'s result: no `analytics.initialize()` needed. It reaches Analytics, journeys and the ad networks, according to consent. `appwin.analytics.track` still works, deprecated, and goes through the same stream.
- `appwin.setConsent('denied', 'marketing')`: three purposes, `analytics`, `marketing` and `advertising`, granted by default. Without a purpose, `setConsent(state)` sets the three. `'unknown'` keeps events on the device until the answer. If no purpose is granted, nothing is sent and the local queue is emptied. Every event is sent once, with the purposes it carries in a `purposes` field, the ones granted at that moment. `appwin.analytics.setConsent` is deprecated and sets the three.
- `ConsentState` (`'granted'`, `'denied'`, `'unknown'`) replaces `AnalyticsConsent`, which stays as a deprecated type alias. A consent stored by 0.13 stays in force on the three purposes.
- `advertising` is a purpose of the event stream only; it has no link with any ad network setting of the native SDKs.
- Sessions and lifecycle start at `createAppwin`, not at `analytics.initialize()`: `session_start` / `session_end`, `app_open` and `app_background` (tab visible or hidden) are sent whichever way you use the SDK. The lifecycle is wired only when a `document` exists, so `createAppwin` still runs in a worker or on a server. There is still no `app_install` or `app_update` on the web.
- `app_open`, `app_background`, `push_opt_in` and `push_opened` are now reserved event names: `track` ignores them.

**Two things to tell your studios**

- A journey triggered on `session_start` now starts when the customer comes back after 30 minutes away, not on every process launch. On the web, the same events now reach journeys as soon as `createAppwin` runs.
- Calling both `appwin.track('purchase')` and the deprecated `appwin.analytics.track('purchase')` counts the purchase twice: remove the old call.
