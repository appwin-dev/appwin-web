/**
 * The studio's configuration, turned into what the stylesheet reads.
 *
 * The whole messenger is painted from CSS variables, so a studio changing its
 * brand in the dashboard changes the widget with no deployment on our side
 * (`docs/sdk-config-driven-ui.md`). Nothing below picks a colour of its own.
 */

import type { MessengerConfig, MessengerDesign } from '../../support/types.ts'

/** The four steps the dashboard offers, in pixels. */
const RADIUS: Record<MessengerDesign['radius'], string> = {
  low: '6px',
  medium: '10px',
  high: '16px',
  max: '24px',
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
  for (const [name, value] of Object.entries(themeVariables(config))) {
    root.style.setProperty(name, value)
  }
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
 * A shade of the studio's colour, for a gradient or a backdrop.
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
 * The fill of the one button painted in the studio's colour.
 *
 * `autoGradient` is a switch in the dashboard's Design tab, and the preview
 * there renders exactly this (`brandButtonStyle`).
 */
export function brandFill(config: MessengerConfig): string {
  const brand = config.colors.primary
  if (!config.design.autoGradient) return brand
  return `linear-gradient(155deg, ${darkenHex(brand)} 0%, ${brand} 100%)`
}
