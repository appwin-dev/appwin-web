/**
 * When the messenger is mounted, shown and hidden, apart from the DOM.
 *
 * The loader draws; this decides. Kept out of `loader.ts` so the rules below
 * run under `node --test` without a browser, and because they are the part a
 * studio relies on when it opens Support from its own button.
 *
 * - With the launcher (the default), the panel is mounted right away, hidden,
 *   so it boots and fetches its config while the page is untouched; the
 *   launcher appears once that config is in.
 * - Without it (`data-appwin-launcher="false"`), nothing is mounted and nothing
 *   is fetched until the first `open()`: a page that never opens Support pays
 *   for nothing but this script.
 * - Either way, an `open()` that comes before the panel is ready is held and
 *   honoured on `ready`: the visitor never sees a blank frame, and a panel that
 *   never boots (a domain not declared) never covers the page with one.
 */

export interface WidgetView {
  /** Creates the panel iframe. Called at most once. */
  mountPanel(): void
  /** Shows or hides the panel, and moves the launcher to match. */
  showPanel(open: boolean): void
  /** The launcher appears, once the panel's config is in. Never called without a launcher. */
  showLauncher(): void
}

export interface WidgetController {
  open(): void
  close(): void
  toggle(): void
  /** The panel said `ready`. */
  ready(): void
  /** Whether the panel is on screen. */
  readonly isOpen: boolean
  /** Whether the panel iframe exists yet. */
  readonly isMounted: boolean
}

export function createWidgetController(options: { launcher: boolean }, view: WidgetView): WidgetController {
  let mounted = false
  let isReady = false
  /** What the host asked for, which may not be on screen yet. */
  let wanted = false
  let shown = false

  const mount = (): void => {
    if (mounted) return
    mounted = true
    view.mountPanel()
  }

  const sync = (): void => {
    const next = wanted && isReady
    if (next === shown) return
    shown = next
    view.showPanel(next)
  }

  const setWanted = (next: boolean): void => {
    wanted = next
    if (next) mount()
    sync()
  }

  if (options.launcher) mount()

  return {
    open: () => setWanted(true),
    close: () => setWanted(false),
    // On what the visitor sees: a toggle before `ready` opens, a second one cancels.
    toggle: () => setWanted(!wanted),
    ready() {
      if (isReady) return
      isReady = true
      if (options.launcher) view.showLauncher()
      sync()
    },
    get isOpen() {
      return shown
    },
    get isMounted() {
      return mounted
    },
  }
}

/**
 * Reads `data-appwin-launcher`. Only an explicit `false` (or `off`, `0`) hides
 * the launcher: an absent or unreadable value keeps the default, so no snippet
 * pasted before this option loses its button.
 */
export function readLauncherOption(value: string | null): boolean {
  if (value === null) return true
  return !['false', 'off', '0'].includes(value.trim().toLowerCase())
}
