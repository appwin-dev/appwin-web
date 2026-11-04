import { PIPELINE_CONFIG, type Pipeline } from './pipeline.ts'

/**
 * Flushes on a timer and reports the page going hidden and visible again to
 * the pipeline. `visibilitychange` is the last event browsers reliably deliver
 * before a tab is closed or frozen, `pagehide` and `unload` are not.
 */
export function watchLifecycle(pipeline: Pipeline): () => void {
  const timer = setInterval(() => void pipeline.flush(), PIPELINE_CONFIG.flushIntervalMs)
  // Node only (a test with a fake `document`): a forgotten timer must not keep the process alive.
  ;(timer as { unref?: () => void }).unref?.()

  const onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') pipeline.onBackground()
    else pipeline.onForeground()
  }
  document.addEventListener('visibilitychange', onVisibilityChange)

  return () => {
    clearInterval(timer)
    document.removeEventListener('visibilitychange', onVisibilityChange)
  }
}
