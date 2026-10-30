import { AppwinError, type AppwinErrorCode } from '../core/errors.ts'
import type { Session } from '../core/session.ts'
import type { WireEvent } from './types.ts'

/**
 * - `ok`: ingested, delete the batch.
 * - `quota_exceeded`: dropped by the server on purpose (hard-capped plan), delete and do not retry.
 * - `retry`: transient, keep the batch and back off.
 * - `drop`: refused for good, retrying would block the queue forever.
 */
export type SendOutcome = 'ok' | 'quota_exceeded' | 'retry' | 'drop'

export type SendBatch = (events: WireEvent[]) => Promise<SendOutcome>

interface IngestResponse {
  accepted: number
  rejected: number
  quotaExceeded?: boolean
}

const PERMANENT_ERRORS: ReadonlySet<AppwinErrorCode> = new Set([
  'bad_request',
  'not_found',
  'origin_not_allowed',
])

export function createSender(session: Session): SendBatch {
  return async (events) => {
    try {
      const response = await session.fetch<IngestResponse>({
        method: 'POST',
        path: '/api/sdk/v1/events',
        body: { events, sentAt: new Date().toISOString() },
        // A batch is often sent as the visitor leaves; batches are sized to fit the 64 KB limit.
        keepalive: true,
      })
      return response.quotaExceeded ? 'quota_exceeded' : 'ok'
    } catch (err) {
      return failureOutcome(err, 'analytics batch')
    }
  }
}

/** Shared by every upload (events, crash reports) so they give up on exactly the same answers. */
export function failureOutcome(err: unknown, label: string): 'retry' | 'drop' {
  if (err instanceof AppwinError && PERMANENT_ERRORS.has(err.code)) {
    console.warn(`[appwin] ${label} refused: ${err.message}`)
    return 'drop'
  }
  return 'retry'
}
