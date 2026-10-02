/**
 * Errors the SDK raises.
 *
 * One class with a machine-readable `code`, rather than a class per case: a
 * studio branches on the code, and a hierarchy would only make `instanceof`
 * checks fail across bundlers that duplicate the module.
 */
export type AppwinErrorCode =
  /** The declared origins do not include this page (see the dashboard, SDK tab). */
  | 'origin_not_allowed'
  /** Unknown or disabled App ID. */
  | 'unauthorized'
  /** The server refused the payload. */
  | 'bad_request'
  /** Asked for something that is not there, or no longer is. */
  | 'not_found'
  /** Too many requests from this address. */
  | 'rate_limited'
  /** The server failed. */
  | 'server_error'
  /** The request never reached the server (offline, DNS, CORS). */
  | 'network'
  /** The caller aborted. */
  | 'aborted'

export class AppwinError extends Error {
  readonly code: AppwinErrorCode
  /** HTTP status, when the failure came back from the server. */
  readonly status: number | null

  constructor(code: AppwinErrorCode, message: string, status: number | null = null) {
    super(message)
    this.name = 'AppwinError'
    this.code = code
    this.status = status
  }

  /** True while retrying could plausibly work. */
  get retryable(): boolean {
    return this.code === 'network' || this.code === 'server_error' || this.code === 'rate_limited'
  }
}

/** Maps an HTTP status onto the code a studio branches on. */
export function codeForStatus(status: number): AppwinErrorCode {
  if (status === 403) return 'origin_not_allowed'
  if (status === 401) return 'unauthorized'
  if (status === 404) return 'not_found'
  if (status === 429) return 'rate_limited'
  if (status >= 500) return 'server_error'
  return 'bad_request'
}
