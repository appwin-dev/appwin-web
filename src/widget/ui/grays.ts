/**
 * Gray scales for the `grayWarmth` knob, coolest (slate) to warmest (stone).
 * Tailwind gray families; the neutral family matches the Figma Grey primitives.
 * Semantic mapping (Figma Tokens-color): page=50/950 (the panel behind cards),
 * surface=white/900 (bg/container, the cards), raised=100/800 (bg/low),
 * border=200/700, text=900/white, muted=700/400, subtle=400/500.
 */
import type { GrayWarmth } from '../../support/types.ts'

interface GraySet {
  /** Panel background (Figma --bg/page); the cards sit on top of it. */
  page: string
  surface: string
  raised: string
  text: string
  muted: string
  /** Delicate label tone (Figma --text/subtle), lighter than `muted`. */
  subtle: string
  border: string
}

const SCALES: Record<GrayWarmth, { light: GraySet; dark: GraySet }> = {
  slate: {
    light: { page: '#f8fafc', surface: '#ffffff', raised: '#f1f5f9', text: '#0f172a', muted: '#334155', subtle: '#94a3b8', border: '#e2e8f0' },
    dark: { page: '#020617', surface: '#0f172a', raised: '#1e293b', text: '#ffffff', muted: '#94a3b8', subtle: '#64748b', border: '#334155' },
  },
  gray: {
    light: { page: '#f9fafb', surface: '#ffffff', raised: '#f3f4f6', text: '#111827', muted: '#374151', subtle: '#9ca3af', border: '#e5e7eb' },
    dark: { page: '#030712', surface: '#111827', raised: '#1f2937', text: '#ffffff', muted: '#9ca3af', subtle: '#6b7280', border: '#374151' },
  },
  zinc: {
    light: { page: '#fafafa', surface: '#ffffff', raised: '#f4f4f5', text: '#18181b', muted: '#3f3f46', subtle: '#a1a1aa', border: '#e4e4e7' },
    dark: { page: '#09090b', surface: '#18181b', raised: '#27272a', text: '#ffffff', muted: '#a1a1aa', subtle: '#71717a', border: '#3f3f46' },
  },
  neutral: {
    light: { page: '#fafafa', surface: '#ffffff', raised: '#f5f5f5', text: '#171717', muted: '#404040', subtle: '#a3a3a3', border: '#e5e5e5' },
    dark: { page: '#0a0a0a', surface: '#171717', raised: '#262626', text: '#ffffff', muted: '#a3a3a3', subtle: '#737373', border: '#404040' },
  },
  stone: {
    light: { page: '#fafaf9', surface: '#ffffff', raised: '#f5f5f4', text: '#1c1917', muted: '#44403c', subtle: '#a8a29e', border: '#e7e5e4' },
    dark: { page: '#0c0a09', surface: '#1c1917', raised: '#292524', text: '#ffffff', muted: '#a8a29e', subtle: '#78716c', border: '#44403c' },
  },
}

export function grayVars(warmth: GrayWarmth, scheme: 'light' | 'dark'): Record<string, string> {
  const s = SCALES[warmth][scheme]
  return {
    '--appwin-page': s.page,
    '--appwin-surface': s.surface,
    '--appwin-raised': s.raised,
    '--appwin-text': s.text,
    '--appwin-muted': s.muted,
    '--appwin-subtle': s.subtle,
    '--appwin-border': s.border,
  }
}
