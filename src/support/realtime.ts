import type { Session } from '../core/session.ts'

/**
 * Events the messenger reacts to. Anything else on the socket is ignored.
 *
 * `message` carries no conversation id, and that is not an omission: the server
 * sends a minimal payload whose `resourceId` is the MESSAGE id (ADR-0016), so
 * nobody downstream can tell which thread moved without asking. The native SDKs
 * answer it the same way, by refetching the conversation list.
 */
export type SupportRealtimeEvent =
  | { type: 'message' }
  | { type: 'conversation'; conversationId: string }
  | { type: 'typing'; conversationId: string; isTyping: boolean }

export interface RealtimeOptions {
  session: Session
  /** Gateway origin, e.g. `wss://ws.appwin.io`. */
  gatewayUrl: string
  onEvent: (event: SupportRealtimeEvent) => void
  /** Told when the socket comes and goes, so the UI can refetch after a gap. */
  onConnectionChange?: (connected: boolean) => void
}

/** Protocol version of the text channel. A frame from another one is dropped. */
const PROTOCOL_VERSION = 1

/** Server closes with this when the short-lived token expires mid-connection. */
const CLOSE_UNAUTHORIZED = 4001

const PING_INTERVAL_MS = 25_000
const MAX_BACKOFF_MS = 30_000
const BASE_BACKOFF_MS = 1_000

interface Envelope {
  v: number
  t: string
  id: string
  data: Record<string, unknown>
}

/**
 * Live updates for the messenger.
 *
 * The realtime token lasts sixty seconds, far less than a browser tab, so it is
 * minted fresh on every connection attempt rather than held. That also makes
 * reconnection the only recovery path we need: expiry, sleep, network change
 * and a server rolling update all end the same way, in `reconnect`.
 *
 * Events carry no content, only what changed (ADR-0028 §2). The consumer
 * refetches over REST, which keeps one source of truth and means a dropped
 * frame costs a stale view until the next event, never a wrong one.
 */
export class SupportRealtime {
  private socket: WebSocket | null = null
  private attempts = 0
  private pingTimer: ReturnType<typeof setInterval> | null = null
  private retryTimer: ReturnType<typeof setTimeout> | null = null
  private closed = false

  private readonly options: RealtimeOptions

  constructor(options: RealtimeOptions) {
    this.options = options
  }

  async connect(): Promise<void> {
    this.closed = false
    await this.open()
  }

  /** Stops for good: no further reconnection, unlike a dropped socket. */
  disconnect(): void {
    this.closed = true
    this.clearTimers()
    // 1000 is a clean shutdown, which tells the gateway not to expect us back.
    this.socket?.close(1000)
    this.socket = null
  }

  private async open(): Promise<void> {
    if (this.closed) return

    let token: string
    try {
      const minted = await this.options.session.fetch<{ token: string; expiresIn: number }>({
        method: 'POST',
        path: '/api/sdk/v1/realtime/token',
      })
      token = minted.token
    } catch {
      // Realtime is an enhancement: polling the REST API still works, and the
      // messenger must not break because the gateway is unreachable.
      this.scheduleReconnect()
      return
    }

    // The token rides in the query string because a browser cannot set headers
    // on a WebSocket handshake. It lives sixty seconds and grants only this
    // customer's topics, which is what makes that acceptable.
    const socket = new WebSocket(`${this.options.gatewayUrl}/ws?t=${encodeURIComponent(token)}`)
    this.socket = socket

    socket.onopen = () => {
      this.attempts = 0
      // The gateway holds no product logic (ADR-0028 §10): a connection is
      // routed nothing until it asks, topic by topic. The token's claims are
      // the authoritative list, which is why they are read here rather than
      // rebuilt from the customer id.
      for (const topic of topicsOf(token)) {
        socket.send(JSON.stringify({ a: 'sub', topic }))
      }
      this.options.onConnectionChange?.(true)
      this.startPing()
    }

    socket.onmessage = (event) => this.onFrame(event.data)

    socket.onclose = (event) => {
      this.stopPing()
      this.options.onConnectionChange?.(false)
      if (this.closed) return
      // An expired token is the expected way a long-lived tab loses the socket,
      // so it reconnects immediately rather than backing off like a failure.
      if (event.code === CLOSE_UNAUTHORIZED) this.attempts = 0
      this.scheduleReconnect()
    }

    // `onerror` is always followed by `onclose`, so reconnection is handled
    // there and this only exists to stop the browser logging an unhandled one.
    socket.onerror = () => {}
  }

  private onFrame(raw: unknown): void {
    if (typeof raw !== 'string') return

    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      return
    }
    if (!parsed || typeof parsed !== 'object') return

    // Control acknowledgements (`pong`, `sub:ok`) share the channel.
    const envelope = parsed as Partial<Envelope>
    if (envelope.v !== PROTOCOL_VERSION) return
    if (typeof envelope.t !== 'string' || !envelope.data) return

    const event = toSupportEvent(envelope.t, envelope.data)
    if (event) this.options.onEvent(event)
  }

  private startPing(): void {
    this.stopPing()
    // Idle WebSockets are dropped by proxies after about a minute; this keeps
    // the connection alive without the server having to guess.
    this.pingTimer = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) this.socket.send('{"a":"ping"}')
    }, PING_INTERVAL_MS)
  }

  private stopPing(): void {
    if (this.pingTimer) clearInterval(this.pingTimer)
    this.pingTimer = null
  }

  private clearTimers(): void {
    this.stopPing()
    if (this.retryTimer) clearTimeout(this.retryTimer)
    this.retryTimer = null
  }

  /**
   * Exponential backoff with jitter. The jitter is the point: a server restart
   * disconnects every visitor of every studio at once, and without it they all
   * come back in the same millisecond.
   */
  private scheduleReconnect(): void {
    if (this.closed || this.retryTimer) return

    const exponential = Math.min(BASE_BACKOFF_MS * 2 ** this.attempts, MAX_BACKOFF_MS)
    const delay = exponential * (0.5 + Math.random() * 0.5)
    this.attempts += 1

    this.retryTimer = setTimeout(() => {
      this.retryTimer = null
      void this.open()
    }, delay)
  }
}

/**
 * The topics a realtime token grants, read from its own claims.
 *
 * The token is not verified here, and must not be: it is signed for the
 * gateway, which is the only party that can trust it. Reading the claims only
 * tells us what to ask for, and a forged list buys nothing since every `sub`
 * is checked server side against the same claims.
 */
function topicsOf(token: string): string[] {
  const payload = token.split('.')[1]
  if (!payload) return []

  try {
    // Base64url, and `atob` only reads base64: two characters to swap, and the
    // padding the JWT spec strips to put back.
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='))) as {
      topics?: unknown
    }
    if (!Array.isArray(decoded.topics)) return []
    return decoded.topics.filter((topic): topic is string => typeof topic === 'string')
  } catch {
    // A token we cannot read is one the gateway will refuse anyway; the socket
    // then closes on its own and reconnection handles it.
    return []
  }
}

/** Maps a server event name onto what the messenger cares about. */
function toSupportEvent(
  name: string,
  data: Record<string, unknown>,
): SupportRealtimeEvent | null {
  if (name === 'support.message.created' || name === 'support.message.updated') {
    // `resourceId` is the message id here, not the thread's. Resolving it would
    // cost a read of a message we are about to refetch anyway.
    return { type: 'message' }
  }

  if (name === 'support.conversation.updated') {
    // The one event whose `resourceId` IS the conversation.
    if (typeof data.resourceId !== 'string') return null
    return { type: 'conversation', conversationId: data.resourceId }
  }

  if (name === 'support.typing') {
    // Only the studio side is echoed back to the visitor: the SDK is what sent
    // the customer's own typing in the first place.
    if (data.typingActor === 'customer') return null
    const conversationId =
      typeof data.conversationId === 'string'
        ? data.conversationId
        : typeof data.resourceId === 'string'
          ? data.resourceId
          : null
    if (!conversationId) return null
    return { type: 'typing', conversationId, isTyping: data.isTyping === true }
  }

  return null
}
