import { PIPELINE_CONFIG, type Pipeline } from './pipeline.ts'
import type { SessionTracker } from './session-tracker.ts'

/**
 * Flushes on a timer and when the page is hidden. `visibilitychange` is the
 * last event browsers reliably deliver before a tab is closed or frozen,
 * `pagehide` and `unload` are not.
 */
export function watchLifecycle(pipeline: Pipeline, sessions: SessionTracker): () => void {
  const timer = setInterval(() => void pipeline.flush(), PIPELINE_CONFIG.flushIntervalMs)

  const onVisibilityChange = () => {
    if (document.visibilityState !== 'hidden') return
    sessions.markInactive()
    void pipeline.flush()
  }
  document.addEventListener('visibilitychange', onVisibilityChange)

  return () => {
    clearInterval(timer)
    document.removeEventListener('visibilitychange', onVisibilityChange)
  }
}
