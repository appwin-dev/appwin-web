import type { Session } from '../../core/session.ts'
import { failureOutcome, type SendOutcome } from '../sender.ts'
import type { CrashReport } from './types.ts'

export type SendCrashes = (
  reports: CrashReport[],
) => Promise<Exclude<SendOutcome, 'quota_exceeded'>>

export function createCrashSender(session: Session): SendCrashes {
  return async (crashes) => {
    try {
      await session.fetch<unknown>({
        method: 'POST',
        path: '/api/sdk/v1/crashes',
        body: { crashes, sentAt: new Date().toISOString() },
        // An uncaught error is often the last thing a page does.
        keepalive: true,
      })
      return 'ok'
    } catch (err) {
      return failureOutcome(err, 'crash reports')
    }
  }
}
