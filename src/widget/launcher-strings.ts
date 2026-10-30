/**
 * The three labels the loader needs, kept apart from the rest.
 *
 * The loader is the file served from the CDN on every page of every studio,
 * and it is measured in kilobytes. Importing the full catalogue for an
 * `aria-label` put every screen's copy, in every language, into it: a bundler
 * cannot drop object properties it cannot prove unused.
 *
 * `strings.ts` builds on this, so a key still exists in one place.
 */

export interface LauncherStrings {
  openMessenger: string
  closeMessenger: string
  messenger: string
}

export const LAUNCHER_EN: LauncherStrings = {
  openMessenger: 'Open the support messenger',
  closeMessenger: 'Close the support messenger',
  messenger: 'Support messenger',
}

export const LAUNCHER_FR: LauncherStrings = {
  openMessenger: "Ouvrir la messagerie d'assistance",
  closeMessenger: "Fermer la messagerie d'assistance",
  messenger: "Messagerie d'assistance",
}

const CATALOGUE: Record<string, LauncherStrings> = { en: LAUNCHER_EN, fr: LAUNCHER_FR }

/** Picks a catalogue from a BCP 47 tag (`fr-CA` reads as `fr`). */
export function launcherStrings(locale: string | null | undefined): LauncherStrings {
  const language = (locale ?? '').toLowerCase().split('-')[0]
  return (language && CATALOGUE[language]) || LAUNCHER_EN
}
