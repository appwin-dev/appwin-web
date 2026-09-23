/**
 * Everything the screens display that is not a raw field.
 *
 * Kept out of the components on purpose: these are the rules a reader would
 * otherwise have to reconstruct from JSX, and they are the ones that go
 * subtly wrong (a thread that says "1 min" an hour later, a day separator on
 * the wrong side of midnight). Plain functions, so the tests need no DOM.
 */

import type { Conversation, Message } from '../../support/types.ts'
import type { WidgetStrings } from '../strings.ts'

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY

/**
 * Age of a thread, in the shape the inbox rows use.
 *
 * Same ladder as the native SDKs: minutes, hours, days, weeks, then the date
 * itself. Past a month the exact day matters more than the distance.
 */
export function relativeTime(iso: string, strings: WidgetStrings, locale: string, now = Date.now()): string {
  const at = new Date(iso).getTime()
  if (Number.isNaN(at)) return ''

  const elapsed = Math.max(0, now - at)
  if (elapsed < MINUTE) return strings.justNow
  if (elapsed < HOUR) return strings.relativeMinutes.replace('{n}', String(Math.floor(elapsed / MINUTE)))
  if (elapsed < DAY) return strings.relativeHours.replace('{n}', String(Math.floor(elapsed / HOUR)))
  if (elapsed < WEEK) return strings.relativeDays.replace('{n}', String(Math.floor(elapsed / DAY)))
  if (elapsed < 5 * WEEK) return strings.relativeWeeks.replace('{n}', String(Math.floor(elapsed / WEEK)))

  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(at)
}

/** Clock on a bubble, in the visitor's own convention (24h here, AM/PM there). */
export function timeOfDay(iso: string, locale: string): string {
  const at = new Date(iso)
  if (Number.isNaN(at.getTime())) return ''
  return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(at)
}

/** Separator above the first message of each day. */
export function dayLabel(iso: string, strings: WidgetStrings, locale: string, now = Date.now()): string {
  const at = new Date(iso)
  if (Number.isNaN(at.getTime())) return ''

  const startOfDay = (date: Date): number =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()

  const days = Math.round((startOfDay(new Date(now)) - startOfDay(at)) / DAY)
  if (days === 0) return strings.today
  if (days === 1) return strings.yesterday

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    // The year only when it is not the current one: "12 March 2024" on an old
    // thread, "12 March" on this year's.
    ...(at.getFullYear() === new Date(now).getFullYear() ? {} : { year: 'numeric' }),
  }).format(at)
}

export interface MessageGroup {
  day: string
  messages: Message[]
}

/**
 * Oldest first, split into days.
 *
 * The API answers newest first (it pages backwards through history), but a
 * thread reads downwards, so the reversal happens once here rather than in
 * every component that touches the list.
 */
export function groupByDay(
  messages: readonly Message[],
  strings: WidgetStrings,
  locale: string,
  now = Date.now(),
): MessageGroup[] {
  const groups: MessageGroup[] = []
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i]
    if (!message) continue
    const day = dayLabel(message.createdAt, strings, locale, now)
    const last = groups[groups.length - 1]
    if (last && last.day === day) last.messages.push(message)
    else groups.push({ day, messages: [message] })
  }
  return groups
}

/** One line under a thread's title: who spoke last, and what they said. */
export function conversationPreview(conversation: Conversation, strings: WidgetStrings): string {
  const preview = conversation.preview?.trim()
  if (!preview) return strings.newConversationPreview
  if (conversation.lastMessageAuthorType === 'customer') {
    return strings.youPreview.replace('{message}', preview)
  }
  return preview
}

/**
 * Up to two letters for an avatar with no image.
 *
 * Reads graphemes rather than code units: a studio called "🪐 Saturn" gets its
 * planet, not half a surrogate pair.
 */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  const letters = words.slice(0, 2).map((word) => [...word][0] ?? '')
  return letters.join('').toUpperCase()
}

/** Human size for a file bubble: bytes are not something to read. */
export function fileSize(bytes: number, locale: string): string {
  const units = ['B', 'kB', 'MB', 'GB']
  let value = Math.max(0, bytes)
  let unit = 0
  while (value >= 1000 && unit < units.length - 1) {
    value /= 1000
    unit += 1
  }
  const rounded = new Intl.NumberFormat(locale, { maximumFractionDigits: value < 10 && unit > 0 ? 1 : 0 })
  return `${rounded.format(value)} ${units[unit]}`
}
