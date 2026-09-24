/**
 * The widget's own copy, in the visitor's language.
 *
 * Everything a visitor reads that is the studio's (welcome message, agent
 * name, FAQ) comes from the server already translated; what is left is the
 * chrome around it, and that is this file. It is hand-held rather than run
 * through an i18n library because the panel is measured in kilobytes and a
 * catalogue loader would cost more than the catalogue.
 *
 * The keys mirror `SupportStrings` on iOS and `SupportStrings.kt` on Android,
 * with the same wording: a visitor who uses a studio's app and its site must
 * not meet two different messengers. Placeholders are `{named}` rather than
 * `%@` or `%d`, which is the only difference a translator will see.
 *
 * English is the fallback, as everywhere else in the SDK. Adding a language is
 * adding an entry to `CATALOGUE`, and nothing else.
 *
 * The launcher's own three labels live in `launcher-strings.ts`: the loader
 * needs them and must not carry everything else with them.
 */

import { LAUNCHER_EN, LAUNCHER_FR, type LauncherStrings } from './launcher-strings.ts'

export interface WidgetStrings extends LauncherStrings {
  /* Frame */
  close: string
  back: string
  retry: string

  /* Home */
  greetingNamed: string
  greetingYou: string
  greetingSubtitle: string
  sendToSupport: string
  conversations: string
  conversationsTitle: string
  recentMessage: string
  faq: string
  noArticles: string

  /* Conversations */
  noConversation: string
  emptyConversationsHint: string
  newConversationPreview: string
  youPreview: string
  statusResolved: string
  statusClosed: string

  /* Messenger */
  editMessage: string
  deleteMessage: string
  editingBanner: string
  cancel: string
  save: string
  react: string
  showOriginal: string
  seeTranslation: string
  writeMessage: string
  messagePlaceholder: string
  send: string
  attachFile: string
  typing: string
  seen: string
  sent: string
  agentFallback: string

  /* Failures */
  loadErrorTitle: string
  loadErrorMessage: string
  offline: string

  /* Time */
  today: string
  yesterday: string
  justNow: string
  relativeMinutes: string
  relativeHours: string
  relativeDays: string
  relativeWeeks: string
}

const EN: WidgetStrings = {
  ...LAUNCHER_EN,
  close: 'Close',
  back: 'Back',
  retry: 'Retry',

  greetingNamed: 'Hello {name} 👋',
  greetingYou: 'you',
  greetingSubtitle: 'Need help?',
  sendToSupport: 'Send us a message',
  conversations: 'Your conversations',
  conversationsTitle: 'My conversations',
  recentMessage: 'Recent message',
  faq: 'Help centre',
  noArticles: 'No articles',

  noConversation: 'No conversation yet',
  emptyConversationsHint: 'Write to support to get started - we reply here.',
  newConversationPreview: 'New conversation',
  youPreview: 'You: {message}',
  statusResolved: 'Resolved',
  statusClosed: 'Closed',

  editMessage: 'Edit',
  deleteMessage: 'Delete',
  editingBanner: 'Editing message',
  cancel: 'Cancel',
  save: 'Save',
  react: 'React',
  showOriginal: 'Show original',
  seeTranslation: 'See translation',
  writeMessage: 'Write a message',
  messagePlaceholder: 'Write a message…',
  send: 'Send',
  attachFile: 'Attach a file',
  typing: 'Typing',
  seen: 'Seen',
  sent: 'Sent',
  agentFallback: 'Support',

  loadErrorTitle: "Couldn't load",
  loadErrorMessage: 'Check your connection and try again.',
  offline: 'The messenger is unreachable right now.',

  today: 'Today',
  yesterday: 'Yesterday',
  justNow: 'Just now',
  relativeMinutes: '{n} min',
  relativeHours: '{n} h',
  relativeDays: '{n} d',
  relativeWeeks: '{n} w',
}

const FR: WidgetStrings = {
  ...LAUNCHER_FR,
  close: 'Fermer',
  back: 'Retour',
  retry: 'Réessayer',

  greetingNamed: 'Hello {name} 👋',
  greetingYou: 'toi',
  greetingSubtitle: "Besoin d'aide ?",
  sendToSupport: 'Envoyer un message au support',
  conversations: 'Vos conversations',
  conversationsTitle: 'Mes conversations',
  recentMessage: 'Message récent',
  faq: "Centre d'aide",
  noArticles: 'Aucun article',

  noConversation: 'Aucune conversation',
  emptyConversationsHint: 'Écris au support pour démarrer - on te répond ici.',
  newConversationPreview: 'Nouvelle conversation',
  youPreview: 'Vous : {message}',
  statusResolved: 'Résolue',
  statusClosed: 'Fermée',

  editMessage: 'Modifier',
  deleteMessage: 'Supprimer',
  editingBanner: 'Modification du message',
  cancel: 'Annuler',
  save: 'Enregistrer',
  react: 'Réagir',
  showOriginal: "Voir l'original",
  seeTranslation: 'Voir la traduction',
  writeMessage: 'Écrire un message',
  messagePlaceholder: 'Écrire un message…',
  send: 'Envoyer',
  attachFile: 'Joindre un fichier',
  typing: "En train d'écrire",
  seen: 'Vu',
  sent: 'Envoyé',
  agentFallback: 'Support',

  loadErrorTitle: 'Impossible de charger',
  loadErrorMessage: 'Vérifiez votre connexion et réessayez.',
  offline: "La messagerie est injoignable pour l'instant.",

  today: "Aujourd'hui",
  yesterday: 'Hier',
  justNow: "À l'instant",
  relativeMinutes: '{n} min',
  relativeHours: '{n} h',
  relativeDays: '{n} j',
  relativeWeeks: '{n} sem.',
}

const CATALOGUE: Record<string, WidgetStrings> = { en: EN, fr: FR }

/** Picks a catalogue from a BCP 47 tag (`fr-CA` reads as `fr`). */
export function widgetStrings(locale: string | null | undefined): WidgetStrings {
  const language = (locale ?? '').toLowerCase().split('-')[0]
  return (language && CATALOGUE[language]) || EN
}
