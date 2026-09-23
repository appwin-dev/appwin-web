import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { SupportRealtime, type SupportRealtimeEvent } from './realtime.ts'
import type { Session } from '../core/session.ts'

/**
 * Frame handling is the one place the SDK can silently do the wrong thing: a
 * misread payload does not throw, it just refetches the wrong thread or
 * nothing. The parser is private, so it is driven through the entry point the
 * socket itself calls.
 */
function parseFrame(raw: unknown): SupportRealtimeEvent | null {
  let captured: SupportRealtimeEvent | null = null
  const realtime = new SupportRealtime({
    session: {} as Session,
    gatewayUrl: 'wss://ws.test',
    onEvent: (event) => {
      captured = event
    },
  })
  ;(realtime as unknown as { onFrame(raw: unknown): void }).onFrame(raw)
  return captured
}

function envelope(t: string, data: Record<string, unknown>): string {
  return JSON.stringify({ v: 1, t, id: 'evt-1', data })
}

/** A realtime token: only the claims matter, the signature is the gateway's business. */
function tokenWithTopics(topics: unknown): string {
  const payload = Buffer.from(JSON.stringify({ k: 'sdk', topics })).toString('base64url')
  return `header.${payload}.signature`
}

/** Captures what the client says on the wire, without a gateway. */
class FakeSocket {
  static last: FakeSocket | null = null

  readonly sent: string[] = []
  readonly url: string
  onopen: (() => void) | null = null
  onmessage: ((event: { data: unknown }) => void) | null = null
  onclose: ((event: { code: number }) => void) | null = null
  onerror: (() => void) | null = null

  constructor(url: string) {
    this.url = url
    FakeSocket.last = this
  }

  send(raw: string): void {
    this.sent.push(raw)
  }

  close(): void {}
}

/** Connects with the given token and returns what the socket was told. */
async function framesSentOnOpen(token: string): Promise<string[]> {
  const original = globalThis.WebSocket
  ;(globalThis as { WebSocket: unknown }).WebSocket = FakeSocket

  try {
    const realtime = new SupportRealtime({
      session: { fetch: async () => ({ token, expiresIn: 60 }) } as unknown as Session,
      gatewayUrl: 'wss://ws.test',
      onEvent: () => {},
    })
    await realtime.connect()
    FakeSocket.last?.onopen?.()
    const sent = FakeSocket.last?.sent ?? []
    realtime.disconnect()
    return sent
  } finally {
    ;(globalThis as { WebSocket: unknown }).WebSocket = original
  }
}

describe('realtime frame handling', () => {
  it('reports a new message without inventing a conversation id', () => {
    // `resourceId` is the MESSAGE id on this event. Passing it off as a
    // conversation would send the consumer refetching a thread that is not one.
    const event = parseFrame(
      envelope('support.message.created', { resourceId: 'msg-1', orgId: 'org-1' }),
    )
    assert.deepEqual(event, { type: 'message' })
  })

  it('reads the conversation id on the one event that carries it', () => {
    const event = parseFrame(
      envelope('support.conversation.updated', { resourceId: 'conv-1', orgId: 'org-1' }),
    )
    assert.deepEqual(event, { type: 'conversation', conversationId: 'conv-1' })
  })

  it('surfaces the agent typing', () => {
    const event = parseFrame(
      envelope('support.typing', {
        resourceId: 'conv-1',
        orgId: 'org-1',
        conversationId: 'conv-1',
        isTyping: true,
        typingActor: 'agent',
      }),
    )
    assert.deepEqual(event, { type: 'typing', conversationId: 'conv-1', isTyping: true })
  })

  it('ignores the echo of the visitor typing, which the SDK sent itself', () => {
    const event = parseFrame(
      envelope('support.typing', {
        resourceId: 'conv-1',
        orgId: 'org-1',
        conversationId: 'conv-1',
        isTyping: true,
        typingActor: 'customer',
      }),
    )
    assert.equal(event, null)
  })

  it('drops frames it must not act on, rather than throwing', () => {
    // Control acknowledgements share the channel.
    assert.equal(parseFrame('{"a":"pong"}'), null)
    // A protocol version we do not know: ignore it, never guess.
    assert.equal(
      parseFrame(JSON.stringify({ v: 2, t: 'support.message.created', id: 'e', data: {} })),
      null,
    )
    // Other products reach the same socket.
    assert.equal(parseFrame(envelope('community.post.created', { resourceId: 'p', orgId: 'o' })), null)
    assert.equal(parseFrame('not json'), null)
    assert.equal(parseFrame(new ArrayBuffer(4)), null)
    assert.equal(parseFrame(null), null)
  })
})

/**
 * An open socket proves nothing: the gateway routes to a connection only what
 * it has subscribed to, so a client that never asks sits there silent and
 * looks perfectly healthy (found on the first live run of the web channel).
 */
describe('topic subscription', () => {
  it('subscribes to every topic the token grants', async () => {
    const sent = await framesSentOnOpen(
      tokenWithTopics(['sdk:customer:cust-1', 'community:project:proj-1']),
    )
    assert.deepEqual(sent, [
      '{"a":"sub","topic":"sdk:customer:cust-1"}',
      '{"a":"sub","topic":"community:project:proj-1"}',
    ])
  })

  it('stays quiet on a token it cannot read, instead of throwing', async () => {
    assert.deepEqual(await framesSentOnOpen('not-a-jwt'), [])
    assert.deepEqual(await framesSentOnOpen(tokenWithTopics(undefined)), [])
    assert.deepEqual(await framesSentOnOpen(tokenWithTopics('sdk:customer:cust-1')), [])
    // A claim list with junk in it: take the topics, drop the rest.
    assert.deepEqual(await framesSentOnOpen(tokenWithTopics(['sdk:customer:cust-1', 42, null])), [
      '{"a":"sub","topic":"sdk:customer:cust-1"}',
    ])
  })
})
