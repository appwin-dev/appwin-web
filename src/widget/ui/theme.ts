/**
 * The studio's configuration, turned into what the stylesheet reads.
 *
 * The whole messenger is painted from CSS variables, so a studio changing its
 * brand in the dashboard changes the widget with no deployment on our side
 * (`docs/sdk-config-driven-ui.md`). Nothing below picks a colour of its own.
 */

import type { ColorScheme, MessengerConfig, MessengerDesign } from '../../support/types.ts'
import { grayVars } from './grays.ts'

/** The four steps the dashboard offers, in pixels. */
const RADIUS: Record<MessengerDesign['radius'], string> = {
  low: '6px',
  medium: '12px',
  high: '16px',
  max: '33px',
}

/** `system` follows the device; `light`/`dark` force it. */
function resolveScheme(scheme: ColorScheme): 'light' | 'dark' {
  if (scheme !== 'system') return scheme
  return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light'
}

/** Pure, so the mapping is readable without a document to hand. */
export function themeVariables(config: MessengerConfig): Record<string, string> {
  return {
    '--appwin-primary': config.colors.primary,
    '--appwin-primary-foreground': config.colors.primaryForeground,
    '--appwin-radius': RADIUS[config.design.radius] ?? RADIUS.medium,
  }
}

export function applyTheme(config: MessengerConfig, root: HTMLElement): void {
  const scheme = resolveScheme(config.design.colorScheme ?? 'light')
  const vars = { ...themeVariables(config), ...grayVars(config.design.grayWarmth ?? 'slate', scheme) }
  for (const [name, value] of Object.entries(vars)) {
    root.style.setProperty(name, value)
  }
  root.dataset.appwinScheme = scheme
}

/**
 * What the visitor should call the studio.
 *
 * The server already falls back to `Support {project}` when the studio left
 * the agent name empty, so an empty string here means a project whose config
 * predates that; the project name is then a better answer than a generic one.
 */
export function agentLabel(config: MessengerConfig): string {
  return config.context.agentName.trim() || config.context.projectName
}

/** The agent's face, or the project's logo, which is what the studio set. */
export function agentAvatarUrl(config: MessengerConfig): string | null {
  return config.context.agentAvatarUrl ?? config.context.projectLogoUrl
}

/**
 * A shade of the studio's colour, for the banner backdrop.
 *
 * Same arithmetic as `darkenHex` in the dashboard, deliberately: it is not a
 * good way to darken a colour (it multiplies the sRGB channels, so saturated
 * hues shift), but the dashboard's preview is what the studio chose from, and
 * a better formula here would mean two different buttons.
 */
export function darkenHex(hex: string, amount = 0.22): string {
  const channels = hex.replace('#', '').slice(0, 6)
  if (channels.length < 6) return hex

  const shade = (offset: number): string => {
    const value = Number.parseInt(channels.slice(offset, offset + 2), 16)
    if (Number.isNaN(value)) return '00'
    const darker = Math.max(0, Math.min(255, Math.round(value * (1 - amount))))
    return darker.toString(16).padStart(2, '0')
  }

  return `#${shade(0)}${shade(2)}${shade(4)}`
}

/**
 * Default first stop of the brand gradient: a lighter, livelier tint. Same
 * arithmetic as `gradientTintHex` in the dashboard (#F2A6F6 -> #FDD3FF): the
 * HSL lightness closes 55 % of its gap to white, the saturation gains a
 * quarter.
 */
export function gradientTintHex(hex: string): string {
  const channels = hex.replace('#', '').slice(0, 6)
  if (!/^[0-9a-fA-F]{6}$/.test(channels)) return hex
  const channel = (i: number): number => Number.parseInt(channels.slice(i, i + 2), 16) / 255
  const r = channel(0)
  const g = channel(2)
  const b = channel(4)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  const l = (max + min) / 2
  let h = 0
  let s = 0
  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1))
    if (max === r) h = ((g - b) / delta) % 6
    else if (max === g) h = (b - r) / delta + 2
    else h = (r - g) / delta + 4
    h = (h * 60 + 360) % 360
  }
  const s2 = Math.min(1, s * 1.25)
  const l2 = Math.min(1, l + (1 - l) * 0.55)
  const c = (1 - Math.abs(2 * l2 - 1)) * s2
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l2 - c / 2
  const [r1, g1, b1]: [number, number, number] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x]
  const byte = (v: number): string =>
    Math.round(Math.min(1, Math.max(0, v + m)) * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${byte(r1)}${byte(g1)}${byte(b1)}`
}

/**
 * The fill of the one button painted in the studio's colour.
 *
 * `autoGradient` is a switch in the dashboard's Design tab, and the preview
 * there renders exactly this (`brandButtonStyle`).
 */
export function brandFill(config: MessengerConfig): string {
  const brand = config.colors.primary
  if (!config.design.autoGradient) return brand
  const from = config.design.gradientColor ?? gradientTintHex(brand)
  return `linear-gradient(155deg, ${from} 0%, ${brand} 100%) border-box`
}
