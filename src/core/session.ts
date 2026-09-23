import { readDeviceInfo, type DeviceInfo } from './device.ts'
import { AppwinError } from './errors.ts'
import { request, type HttpRequest } from './http.ts'
import type { AppwinStorage } from './storage.ts'

const TOKEN_KEY = 'session-token'
const EXTERNAL_ID_KEY = 'external-id'

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
   * Attaches this browser to a user of the studio's own account.
   *
   * Rotates the session when the identity changes: the token carries the
   * identity server side, so keeping the old one would leave the conversation
   * attributed to whoever was here before. Calling it again with the same id
   * is free, which matters because a host app will call it on every page.
   */
  async identify(externalId: string): Promise<void> {
    if (externalId === this.externalId) {
      await this.authenticate()
      return
    }
    this.externalId = externalId
    this.options.storage.set(EXTERNAL_ID_KEY, externalId)
    await this.open()
  }

  /**
   * Forgets the visitor: new device id on the next call, no thread carried
   * over. What a host app calls when its own user logs out, so that the next
   * person on a shared machine does not read the previous one's support.
   */
  reset(): void {
    this.token = null
    this.externalId = null
    this.options.storage.remove(TOKEN_KEY)
    this.options.storage.remove(EXTERNAL_ID_KEY)
    this.options.storage.remove('device-id')
    // Re-read now, not on the next call: the previous id was cached here and
    // the session opened after a reset would otherwise reuse it, and with it
    // the previous person's thread, which is exactly what reset is meant to
    // prevent.
    this.device = readDeviceInfo(this.options.storage)
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

  /** Opens a session, collapsing concurrent callers onto one request. */
  private open(): Promise<string> {
    if (this.pending) return this.pending

    this.pending = this.requestToken()
      .then((token) => {
        this.token = token
        this.options.storage.set(TOKEN_KEY, token)
        return token
      })
      .finally(() => {
        this.pending = null
      })

    return this.pending
  }

  private async requestToken(): Promise<string> {
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
        ...(this.externalId ? { externalId: this.externalId } : {}),
      },
    })
    return response.token
  }
}
