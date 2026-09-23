import { AppwinError, codeForStatus } from './errors.ts'

export interface HttpRequest {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  path: string
  /** Serialised as JSON. Absent for GET. */
  body?: unknown
  /** Bearer token, when the route needs one. */
  token?: string | null
  /** Extra headers, e.g. `X-Appwin-App-Id` on the unauthenticated init call. */
  headers?: Record<string, string>
  signal?: AbortSignal
  query?: Record<string, string | number | undefined>
}

/**
 * The single place a request leaves the SDK.
 *
 * No retry here on purpose: what deserves a second chance depends on what was
 * asked. A failed read can be retried blindly, a failed send cannot without
 * risking a duplicate message. The decision belongs to the caller, so this
 * layer only turns failures into typed errors.
 */
export async function request<T>(baseUrl: string, req: HttpRequest): Promise<T> {
  const url = new URL(`${baseUrl}${req.path}`)
  for (const [key, value] of Object.entries(req.query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value))
  }

  const headers: Record<string, string> = { Accept: 'application/json', ...req.headers }
  if (req.body !== undefined) headers['Content-Type'] = 'application/json'
  if (req.token) headers.Authorization = `Bearer ${req.token}`

  let response: Response
  try {
    response = await fetch(url.toString(), {
      method: req.method,
      headers,
      body: req.body === undefined ? undefined : JSON.stringify(req.body),
      // Never send the visitor's cookies for the studio's own domain: the SDK
      // authenticates with its own bearer and has no business carrying them.
      credentials: 'omit',
      ...(req.signal ? { signal: req.signal } : {}),
    })
  } catch (err) {
    if (isAbort(err)) throw new AppwinError('aborted', 'Request aborted')
    // A CORS refusal is indistinguishable from an outage here: the browser
    // hides the reason. Say what we know and no more.
    throw new AppwinError('network', 'Could not reach the Appwin API')
  }

  if (!response.ok) {
    throw new AppwinError(
      codeForStatus(response.status),
      await readErrorMessage(response),
      response.status,
    )
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

function isAbort(err: unknown): boolean {
  return err instanceof Error && err.name === 'AbortError'
}

/**
 * Best-effort message from an error response. Never throws: a body that is not
 * the JSON we expected must not replace the status we do know.
 */
async function readErrorMessage(response: Response): Promise<string> {
  try {
    const payload: unknown = await response.json()
    if (payload && typeof payload === 'object' && 'message' in payload) {
      const { message } = payload as { message?: unknown }
      if (typeof message === 'string' && message) return message
    }
  } catch {
    /* falls through to the status line */
  }
  return `HTTP ${response.status}`
}
