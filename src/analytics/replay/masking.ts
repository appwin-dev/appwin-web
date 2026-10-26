import type { ReplaySettings } from './config.ts'

const UNMASK = '[data-appwin-unmask]'

/**
 * Recorded as an empty box of the same size, whatever the settings: what the
 * studio marked as private, and the Appwin widget, whose conversations are
 * not the page's to replay.
 */
const ALWAYS_BLOCKED = ['[data-appwin-mask]', '[data-appwin-widget]']

/**
 * What a visitor types outside a form field. rrweb's `maskAllInputs` stops at
 * `input`, `textarea` and `select`, so a rich text editor would otherwise be
 * recorded in clear whenever `maskAllText` is off.
 */
const EDITABLE = '[contenteditable]:not([contenteditable="false"])'

const IMAGE_TAGS = ['img', 'picture', 'video', 'svg']

/** rrweb's `blockSelector`. */
export function blockSelector(settings: Pick<ReplaySettings, 'maskAllImages'>): string {
  if (!settings.maskAllImages) return ALWAYS_BLOCKED.join(', ')
  const images = IMAGE_TAGS.map((tag) => `${tag}:not(${UNMASK}, ${UNMASK} *)`)
  return [...ALWAYS_BLOCKED, ...images].join(', ')
}

/** rrweb's `maskTextSelector`: every text, or only what a visitor can type into. */
export function maskTextSelector(settings: Pick<ReplaySettings, 'maskAllText'>): string {
  return settings.maskAllText ? '*' : EDITABLE
}

/**
 * rrweb's `maskTextFn`, called for the texts the selector matched. Typed text
 * is masked even under `data-appwin-unmask`, like the inputs that go through
 * `maskAllInputs`, which no attribute overrides either.
 */
export function maskText(text: string, element: Pick<Element, 'closest'> | null): string {
  if (!element?.closest(EDITABLE) && element?.closest(UNMASK)) return text
  return text.replace(/\S/g, '*')
}
