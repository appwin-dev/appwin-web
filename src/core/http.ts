import { AppwinError, codeForStatus } from './errors.ts'

export interface HttpRequest {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  path: string
  /** Serialised as JSON, except a `FormData` which goes out as multipart. Absent for GET. */
  body?: unknown
  /** Bearer token, when the route needs one. */
  token?: string | null
  /** Extra headers, e.g. `X-Appwin-App-Id` on the unauthenticated init call. */
  headers?: Record<string, string>
  signal?: AbortSignal
  /** Lets the request outlive the page, for data sent as the visitor leaves. Body must stay under 64 KB. */
  keepalive?: boolean
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
  // The browser writes the multipart Content-Type itself: it is the only one that knows the boundary.
  const isForm = typeof FormData !== 'undefined' && req.body instanceof FormData
  if (req.body !== undefined && !isForm) headers['Content-Type'] = 'application/json'
  if (req.token) headers.Authorization = `Bearer ${req.token}`

  let response: Response
  try {
    response = await fetch(url.toString(), {
      method: req.method,
      headers,
      body: req.body === undefined ? undefined : isForm ? (req.body as FormData) : JSON.stringify(req.body),
      // Never send the visitor's cookies for the studio's own domain: the SDK
      // authenticates with its own bearer and has no business carrying them.
      credentials: 'omit',
      ...(req.signal ? { signal: req.signal } : {}),
      ...(req.keepalive ? { keepalive: true } : {}),
    })
  } catch (err) {
    if (isAbort(err)) throw new AppwinError('aborted', 'Request aborted')
    // A CORS refusal is indistinguishable from an outage here: the browser
    // hides the reason. Say what we know and no more.
    throw new AppwinError('network', 'Could not reach the Appwin API')
  }

  if (!response.ok) {
    const body = await readErrorBody(response)
    // The plan refusal shares 403 with an undeclared origin: only the body tells them apart.
    if (response.status === 403 && body.code === 'PLAN_UPGRADE_REQUIRED') {
      throw new AppwinError('plan_upgrade_required', planUpgradeMessage(body.product), 403)
    }
    const code = codeForStatus(response.status)
    const message = code === 'origin_not_allowed' ? originNotAllowedMessage() : (body.message ?? `HTTP ${response.status}`)
    throw new AppwinError(code, message, response.status)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

/**
 * The most common setup mistake on the web, so the message says where the fix
 * is rather than echoing the server. The empty-list case is spelled out because
 * localhost is only let through once the list holds at least one domain.
 */
function originNotAllowedMessage(): string {
  const origin = (globalThis as { location?: { origin?: string } }).location?.origin ?? 'This page'
  return (
    `${origin} is not allowed to use this App ID. In the Appwin dashboard, open your app, ` +
    `SDK tab, Web domains, and add it. While that list is empty, every site is refused, localhost included.`
  )
}

function planUpgradeMessage(product: string | undefined): string {
  return (
    `The organisation's plan does not include ${product ?? 'this product'}. ` +
    `Upgrade it at https://appwin.io/pricing.`
  )
}

function isAbort(err: unknown): boolean {
  return err instanceof Error && err.name === 'AbortError'
}

interface ErrorBody {
  message?: string
  code?: string
  product?: string
}

/**
 * Best-effort fields from an error response. Never throws: a body that is not
 * the JSON we expected must not replace the status we do know.
 */
async function readErrorBody(response: Response): Promise<ErrorBody> {
  try {
    const payload: unknown = await response.json()
    if (!payload || typeof payload !== 'object') return {}
    const { message, code, product } = payload as Record<string, unknown>
    return {
      ...(typeof message === 'string' && message ? { message } : {}),
      ...(typeof code === 'string' ? { code } : {}),
      ...(typeof product === 'string' ? { product } : {}),
    }
  } catch {
    return {}
  }
}
