/**
 * Calls `onPageView` with the path of each page the visitor lands on,
 * including client-side navigations of single-page apps.
 *
 * Path only: query strings and hashes often carry tokens or emails, and the
 * events contract is PII-free.
 */
export function watchPageViews(onPageView: (path: string) => void): () => void {
  let lastPath: string | null = null
  const emit = () => {
    const path = location.pathname
    if (path === lastPath) return
    lastPath = path
    onPageView(path)
  }

  // Routers navigate through the History API, which fires no event of its own.
  const { pushState, replaceState } = history
  history.pushState = function (...args) {
    pushState.apply(this, args)
    emit()
  }
  history.replaceState = function (...args) {
    replaceState.apply(this, args)
    emit()
  }
  addEventListener('popstate', emit)
  emit()

  return () => {
    history.pushState = pushState
    history.replaceState = replaceState
    removeEventListener('popstate', emit)
  }
}
