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
      v: 1,
      from: 'appwin-host',
      type: 'open',
    })
    assert.deepEqual(readHostMessage(hostMessage({ type: 'identify', userId: 'u-1' })), {
      v: 1,
      from: 'appwin-host',
      type: 'identify',
      userId: 'u-1',
    })
    assert.deepEqual(readPanelMessage(panelMessage({ type: 'unread', count: 3 })), {
      v: 1,
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
    assert.equal(readHostMessage({ from: 'webpack', type: 'open', v: 1 }), null)
    // A version we do not know: a loader cached on a studio's page outliving
    // this build is the normal case, not an edge one.
    assert.equal(readHostMessage({ from: 'appwin-host', type: 'open', v: 2 }), null)
    assert.equal(readHostMessage({ from: 'appwin-host', type: 'wipe', v: 1 }), null)
  })

  it('refuses a payload whose fields are not what they claim', () => {
    assert.equal(readHostMessage({ from: 'appwin-host', type: 'identify', v: 1 }), null)
    assert.equal(
      readHostMessage({ from: 'appwin-host', type: 'identify', v: 1, userId: '' }),
      null,
    )
    assert.equal(
      readHostMessage({ from: 'appwin-host', type: 'identify', v: 1, userId: { toString: () => 'u' } }),
      null,
    )
    assert.equal(readPanelMessage({ from: 'appwin-panel', type: 'unread', v: 1, count: '3' }), null)
    assert.equal(readPanelMessage({ from: 'appwin-panel', type: 'unread', v: 1, count: NaN }), null)
    assert.equal(readPanelMessage({ from: 'appwin-panel', type: 'ready', v: 1 }), null)
  })

  it('normalises a count rather than trusting it', () => {
    // The badge renders this straight into the DOM: a negative or fractional
    // count is not an error worth dropping the message for, it is a number to
    // put back in range.
    assert.deepEqual(readPanelMessage({ from: 'appwin-panel', type: 'unread', v: 1, count: -4 }), {
      v: 1,
      from: 'appwin-panel',
      type: 'unread',
      count: 0,
    })
    assert.deepEqual(readPanelMessage({ from: 'appwin-panel', type: 'unread', v: 1, count: 2.7 }), {
      v: 1,
      from: 'appwin-panel',
      type: 'unread',
      count: 2,
    })
  })
})
