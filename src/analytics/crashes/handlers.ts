import { describeThrown } from './report.ts'
import type { CrashReporter } from './reporter.ts'

interface ErrorEventLike extends Event {
  error?: unknown
  message?: string
  filename?: string
  lineno?: number
  colno?: number
}

interface RejectionEventLike extends Event {
  reason?: unknown
}

/**
 * Listens for uncaught errors and unhandled rejections, the web's crashes.
 *
 * `addEventListener` rather than `window.onerror`: the host page, Sentry or
 * another SDK may own that slot, and listeners all run side by side. Nothing
 * here calls `preventDefault`, the errors still reach the console.
 */
export function installCrashHandlers(target: EventTarget, reporter: CrashReporter): () => void {
  const onError = (event: Event) => {
    // Failed <img> or <script> loads also fire `error`, targeted at the element.
    if (event.target && event.target !== target) return
    const { error, message, filename, lineno, colno } = event as ErrorEventLike
    // Without `error` (a cross-origin script, "Script error."), the event's own fields are all there is.
    const thrown =
      error !== undefined && error !== null
        ? describeThrown(error, 'Error')
        : { type: 'Error', ...(message ? { message } : {}) }
    reporter.capture({
      kind: 'crash',
      thrown,
      // Browsers report 0 for a position they do not know.
      location: { url: filename || undefined, line: lineno || undefined, col: colno || undefined },
    })
  }

  const onRejection = (event: Event) => {
    reporter.capture({
      kind: 'crash',
      thrown: describeThrown((event as RejectionEventLike).reason, 'UnhandledRejection'),
    })
  }

  // Retries a report that failed offline, or that the closing tab cut off.
  const retry = () => void reporter.flush()
  const doc = (globalThis as { document?: Document }).document

  target.addEventListener('error', onError)
  target.addEventListener('unhandledrejection', onRejection)
  target.addEventListener('online', retry)
  doc?.addEventListener('visibilitychange', retry)

  return () => {
    target.removeEventListener('error', onError)
    target.removeEventListener('unhandledrejection', onRejection)
    target.removeEventListener('online', retry)
    doc?.removeEventListener('visibilitychange', retry)
  }
}
