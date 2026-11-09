import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { hostMessage, panelMessage, readHostMessage, readPanelMessage } from './protocol.ts'

/**
 * `window.postMessage` has no addressee: every frame on a page receives
 * everything every other frame sends, and a widget that acts on what it is
 * handed is a widget the page can drive. These readers are that filter, so
 * what they let through is the whole security of the bridge.
 */
describe('widget bridge', () => {
  it('reads the messages each side sends', () => {
    assert.deepEqual(readHostMessage(hostMessage({ type: 'open' })), {
      v: 2,
      from: 'appwin-host',
      type: 'open',
    })
    assert.deepEqual(readHostMessage(hostMessage({ type: 'identify', externalId: 'u-1' })), {
      v: 2,
      from: 'appwin-host',
      type: 'identify',
      externalId: 'u-1',
    })
    assert.deepEqual(
      readHostMessage(hostMessage({ type: 'identify', externalId: 'u-1', attributes: { plan: 'pro' } })),
      { v: 2, from: 'appwin-host', type: 'identify', externalId: 'u-1', attributes: { plan: 'pro' } },
    )
    assert.deepEqual(readHostMessage(hostMessage({ type: 'logout' })), {
      v: 2,
      from: 'appwin-host',
      type: 'logout',
    })
    assert.deepEqual(readPanelMessage(panelMessage({ type: 'unread', count: 3 })), {
      v: 2,
      from: 'appwin-panel',
      type: 'unread',
      count: 3,
    })
  })

  it('does not let one side speak for the other', () => {
    // A page that got hold of the protocol could still only pretend to be the
    // host; the panel refusing host messages that claim to be its own is what
    // stops a single forged frame from doing both jobs.
    assert.equal(readPanelMessage(hostMessage({ type: 'open' })), null)
    assert.equal(readHostMessage(panelMessage({ type: 'close' })), null)
  })

  it('ignores everything that is not ours', () => {
    assert.equal(readHostMessage(undefined), null)
    assert.equal(readHostMessage('open'), null)
    assert.equal(readHostMessage({ type: 'open' }), null)
    // Another tool's traffic on the same page.
    assert.equal(readHostMessage({ from: 'webpack', type: 'open', v: 2 }), null)
    // A version we do not know: a loader cached on a studio's page outliving
    // this build is the normal case, not an edge one.
    assert.equal(readHostMessage({ from: 'appwin-host', type: 'open', v: 3 }), null)
    assert.equal(readHostMessage({ from: 'appwin-host', type: 'wipe', v: 2 }), null)
  })

  it('refuses a payload whose fields are not what they claim', () => {
    assert.equal(readHostMessage({ from: 'appwin-host', type: 'identify', v: 2 }), null)
    assert.equal(
      readHostMessage({ from: 'appwin-host', type: 'identify', v: 2, externalId: '' }),
      null,
    )
    assert.equal(
      readHostMessage({ from: 'appwin-host', type: 'identify', v: 2, externalId: { toString: () => 'u' } }),
      null,
    )
    assert.equal(
      readHostMessage({ from: 'appwin-host', type: 'updateUser', v: 2, attributes: { email: 42 } }),
      null,
    )
    assert.equal(readHostMessage({ from: 'appwin-host', type: 'updateUser', v: 2 }), null)
    assert.equal(readPanelMessage({ from: 'appwin-panel', type: 'unread', v: 2, count: '3' }), null)
    assert.equal(readPanelMessage({ from: 'appwin-panel', type: 'unread', v: 2, count: NaN }), null)
    assert.equal(readPanelMessage({ from: 'appwin-panel', type: 'ready', v: 2 }), null)
  })

  it('still reads what a cached 0.7 loader sends', () => {
    // Studio pages load the mutable `v1/` URL: an old loader meeting this
    // panel is what happens right after a release, with no upgrade anywhere.
    assert.deepEqual(readHostMessage({ from: 'appwin-host', type: 'identify', v: 1, userId: 'u-1' }), {
      v: 2,
      from: 'appwin-host',
      type: 'identify',
      externalId: 'u-1',
    })
    assert.deepEqual(readHostMessage({ from: 'appwin-host', type: 'reset', v: 1 }), {
      v: 2,
      from: 'appwin-host',
      type: 'logout',
    })
    assert.equal(readHostMessage({ from: 'appwin-host', type: 'logout', v: 1 }), null)
    assert.deepEqual(readPanelMessage({ from: 'appwin-panel', type: 'close', v: 1 }), {
      v: 2,
      from: 'appwin-panel',
      type: 'close',
    })
  })

  it('drops attribute fields it does not know', () => {
    // The host could post its whole user object; only what the API takes crosses.
    assert.deepEqual(
      readHostMessage({
        from: 'appwin-host',
        type: 'updateUser',
        v: 2,
        attributes: { email: 'a@b.co', password: 'hunter2' },
      }),
      { v: 2, from: 'appwin-host', type: 'updateUser', attributes: { email: 'a@b.co' } },
    )
  })

  it('normalises a count rather than trusting it', () => {
    // The badge renders this straight into the DOM: a negative or fractional
    // count is not an error worth dropping the message for, it is a number to
    // put back in range.
    assert.deepEqual(readPanelMessage({ from: 'appwin-panel', type: 'unread', v: 2, count: -4 }), {
      v: 2,
      from: 'appwin-panel',
      type: 'unread',
      count: 0,
    })
    assert.deepEqual(readPanelMessage({ from: 'appwin-panel', type: 'unread', v: 2, count: 2.7 }), {
      v: 2,
      from: 'appwin-panel',
      type: 'unread',
      count: 2,
    })
  })
})
