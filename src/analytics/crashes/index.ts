import type { Session } from '../../core/session.ts'
import type { AppwinStorage } from '../../core/storage.ts'
import type { ConsentStore } from '../consent.ts'
import type { SessionTracker } from '../session-tracker.ts'
import type { Breadcrumbs } from './breadcrumbs.ts'
import { CrashQueue } from './crash-queue.ts'
import { installCrashHandlers } from './handlers.ts'
import { CrashReporter } from './reporter.ts'
import { createCrashSender } from './sender.ts'

export interface CrashReportingDeps {
  session: Session
  storage: AppwinStorage
  consent: ConsentStore
  sessions: SessionTracker
  breadcrumbs: Breadcrumbs
  sdkVersion: string
}

export interface CrashReporting {
  reporter: CrashReporter
  /** Removes the handlers and drops what is queued: analytics is off for this app. */
  stop(): void
}

export function startCrashReporting(deps: CrashReportingDeps): CrashReporting {
  const { session, storage, consent, sessions, breadcrumbs, sdkVersion } = deps
  const queue = new CrashQueue(storage)
  // Reports left by a page load from before the visitor said no.
  if (consent.value === 'denied') queue.clear()

  const reporter = new CrashReporter({
    queue,
    consent,
    send: createCrashSender(session),
    stack: { origin: (globalThis as { location?: Location }).location?.origin ?? null },
    context: () => ({
      // Empty, like the absent `appVersion` of `/auth/init`, when the studio did not pass one.
      appVersion: session.appVersion ?? '',
      os: session.deviceInfo.os ?? '',
      model: session.deviceInfo.model ?? '',
      sdkVersion,
      sessionId: sessions.sessionId,
      screen: breadcrumbs.screen,
      breadcrumbs: breadcrumbs.snapshot(),
    }),
  })

  const target = globalThis as Partial<EventTarget>
  const uninstall =
    typeof target.addEventListener === 'function'
      ? installCrashHandlers(globalThis as unknown as EventTarget, reporter)
      : () => {}

  return {
    reporter,
    stop() {
      uninstall()
      reporter.shutdown()
    },
  }
}
