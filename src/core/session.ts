import { readDeviceInfo, type DeviceInfo } from './device.ts'
import { AppwinError } from './errors.ts'
import { request, type HttpRequest } from './http.ts'
import type { AppwinStorage } from './storage.ts'

const TOKEN_KEY = 'session-token'
const EXTERNAL_ID_KEY = 'external-id'

/**
 * What the studio knows about its user, shown to its agents next to the
 * conversation. Every field is optional, and an omitted one is left untouched
 * server side: sending `{ plan: 'pro' }` does not erase the email.
 */
export interface AppwinUserAttributes {
  email?: string
  name?: string
  avatarUrl?: string
  /** BCP 47 tag, e.g. `fr-FR`. */
  language?: string
  /** IANA zone, e.g. `Europe/Paris`. */
  timezone?: string
  location?: string
  plan?: string
}

const TRAIT_KEYS = [
  'email',
  'name',
  'avatarUrl',
  'language',
  'timezone',
  'location',
  'plan',
] as const satisfies ReadonlyArray<keyof AppwinUserAttributes>

interface InitSessionResponse {
  token: string
  customerSessionId: string
  expiresAt: string | null
}

export interface SessionOptions {
  appId: string
  baseUrl: string
  storage: AppwinStorage
  /** SDK version, reported so the dashboard can show what a visitor is running. */
  sdkVersion: string
}

/**
 * Holds the bearer token and keeps it usable.
 *
 * Two things make this less trivial than it looks in a browser. A tab can stay
 * open for days, long enough for a token to be revoked from the dashboard or
 * rotated by another tab; and several tabs of the same site share one storage,
 * so they race to open sessions. Both come out as a 401 on some later call,
 * which is why the recovery lives here rather than in every caller.
 */
export class Session {
  private token: string | null
  private externalId: string | null
  private device: DeviceInfo
  /** In flight init, shared so concurrent callers do not each open a session. */
  private pending: Promise<string> | null = null
  /** The externalId `pending` was started with. */
  private pendingFor: string | null = null
  private readonly identityListeners = new Set<() => void>()

  private readonly options: SessionOptions

  constructor(options: SessionOptions) {
    this.options = options
    this.token = options.storage.get(TOKEN_KEY)
    this.externalId = options.storage.get(EXTERNAL_ID_KEY)
    this.device = readDeviceInfo(options.storage)
  }

  get deviceId(): string {
    return this.device.deviceId
  }

  /** A token, opening a session if there is none yet. */
  async authenticate(): Promise<string> {
    if (this.token) return this.token
    return this.open()
  }

  /**
   * Called after the session changed hands (identify with a new user, logout),
   * so modules drop what they hold for the previous one. Internal: the host
   * page already knows, it made the call.
   */
  onIdentityChange(listener: () => void): () => void {
    this.identityListeners.add(listener)
    return () => this.identityListeners.delete(listener)
  }

  /**
   * Attaches this browser to a user of the studio's own account.
   *
   * Rotates the session when the identity changes: the token carries the
   * identity server side, so keeping the old one would leave the conversation
   * attributed to whoever was here before. Calling it again with the same id
   * is free, which matters because a host app will call it on every page.
   */
  async identify(externalId: string, attributes?: AppwinUserAttributes): Promise<void> {
    if (!externalId) throw new AppwinError('bad_request', '`externalId` must not be empty')

    if (externalId === this.externalId) {
      await this.authenticate()
    } else {
      this.externalId = externalId
      this.options.storage.set(EXTERNAL_ID_KEY, externalId)
      await this.open()
      this.notifyIdentityChange()
    }
    if (attributes) await this.updateUser(attributes)
  }

  /** Writes attributes on the current user, anonymous or identified. */
  async updateUser(attributes: AppwinUserAttributes): Promise<void> {
    await this.fetch<void>({ method: 'PATCH', path: '/api/sdk/v1/me', body: pickAttributes(attributes) })
  }

  /**
   * Ends the session and starts over as a new anonymous visitor.
   *
   * The device id is rotated too, not only the token: on a shared machine the
   * next person must not inherit the previous one's thread, and that has to
   * hold even when the revoke never reached the server.
   */
  async logout(): Promise<void> {
    const token = this.token
    if (token) {
      try {
        await request<void>(this.options.baseUrl, {
          method: 'POST',
          path: '/api/sdk/v1/auth/revoke',
          token,
        })
      } catch {
        // Offline or already revoked: the local state below is what protects
        // the next visitor, the server-side revoke is housekeeping.
      }
    }

    this.token = null
    this.externalId = null
    this.options.storage.remove(TOKEN_KEY)
    this.options.storage.remove(EXTERNAL_ID_KEY)
    this.options.storage.remove('device-id')
    // Re-read now, not on the next call: the previous id is cached here and the
    // next session would otherwise reuse it, and with it the previous thread.
    this.device = readDeviceInfo(this.options.storage)

    try {
      await this.open()
    } catch {
      // Sessions open lazily anyway: the next call retries and surfaces the
      // error where the host can act on it.
    }
    this.notifyIdentityChange()
  }

  /**
   * Runs an authenticated request, re-opening the session once on a 401.
   *
   * The retry is capped at one attempt and only for `unauthorized`: anything
   * else, including the 403 of an undeclared origin, is the studio's to fix and
   * looping on it would just bury the message.
   */
  async fetch<T>(req: Omit<HttpRequest, 'token'>): Promise<T> {
    const token = await this.authenticate()
    try {
      return await request<T>(this.options.baseUrl, { ...req, token })
    } catch (err) {
      if (!(err instanceof AppwinError) || err.code !== 'unauthorized') throw err
      const fresh = await this.open()
      return request<T>(this.options.baseUrl, { ...req, token: fresh })
    }
  }

  /**
   * Opens a session, collapsing concurrent callers onto one request.
   *
   * Only callers asking for the same identity share it: an `identify` landing
   * while an anonymous init is in flight would otherwise be handed that
   * anonymous token. It waits for the other init instead, then opens its own,
   * so the two land in order and the last identity wins.
   */
  private open(): Promise<string> {
    const externalId = this.externalId
    if (this.pending && this.pendingFor === externalId) return this.pending

    const previous = this.pending?.catch(() => undefined) ?? Promise.resolve()
    const pending: Promise<string> = previous
      .then(() => this.requestToken(externalId))
      .then((token) => {
        this.token = token
        this.options.storage.set(TOKEN_KEY, token)
        return token
      })
      .finally(() => {
        if (this.pending === pending) {
          this.pending = null
          this.pendingFor = null
        }
      })

    this.pending = pending
    this.pendingFor = externalId
    return pending
  }

  private notifyIdentityChange(): void {
    for (const listener of this.identityListeners) listener()
  }

  private async requestToken(externalId: string | null): Promise<string> {
    const response = await request<InitSessionResponse>(this.options.baseUrl, {
      method: 'POST',
      path: '/api/sdk/v1/auth/init',
      headers: { 'X-Appwin-App-Id': this.options.appId },
      body: {
        deviceId: this.device.deviceId,
        platform: this.device.platform,
        sdkVersion: this.options.sdkVersion,
        ...(this.device.model ? { model: this.device.model } : {}),
        ...(this.device.os ? { os: this.device.os } : {}),
        ...(this.device.language ? { language: this.device.language } : {}),
        ...(externalId ? { externalId } : {}),
      },
    })
    return response.token
  }
}

/**
 * Keeps the known fields only, so a plain-JS caller passing a whole user object
 * does not ship the rest of it to our API.
 */
function pickAttributes(attributes: AppwinUserAttributes): AppwinUserAttributes {
  const picked: AppwinUserAttributes = {}
  for (const key of TRAIT_KEYS) {
    const value = attributes[key]
    if (typeof value === 'string') picked[key] = value
  }
  return picked
}
