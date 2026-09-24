/**
 * Home: the screen a visitor lands on.
 *
 * Laid out like the iOS `HomeView`, which is itself laid out like the
 * dashboard's preview, so a studio sees what it configures: banner, greeting,
 * the thread they last had open, the way to write, the way to their inbox,
 * then the help centre.
 */

import { hasUnread } from '../../support/client.ts'
import type { Conversation } from '../../support/types.ts'
import { useUi, useWidgetState } from './app.tsx'
import { Banner } from './banner.tsx'
import { ChevronIcon, InboxIcon, SendToSupportIcon, UnreadDot } from './bits.tsx'
import { conversationPreview, relativeTime } from './format.ts'
import { brandFill } from './theme.ts'

export function HomeScreen() {
  const { store, strings, locale } = useUi()
  const state = useWidgetState()
  const config = state.config
  if (!config) return null

  const recent = mostRecentOpen(state.conversations)
  const inboxHasUnread = state.conversations.some(hasUnread)
  const welcome = config.messaging.welcomeMessageEnabled
    ? config.messaging.welcomeMessage?.trim()
    : ''

  return (
    <div class="screen home">
      <Banner config={config} />

      <div class="greeting">
        <p class="greeting-line">{strings.greetingNamed.replace('{name}', strings.greetingYou)}</p>
        <p class="greeting-line">{strings.greetingSubtitle}</p>
      </div>

      {welcome && <p class="welcome">{welcome}</p>}

      {recent && (
        <button
          type="button"
          class="card recent"
          onClick={() => void store.openThread(recent.id)}
        >
          <div class="card-text">
            <span class="card-label">{strings.recentMessage}</span>
            <span class="card-preview">{conversationPreview(recent, strings)}</span>
          </div>
          <span class="card-meta">
            {hasUnread(recent) && <UnreadDot />}
            {recent.lastMessageAt && relativeTime(recent.lastMessageAt, strings, locale)}
          </span>
        </button>
      )}

      <button
        type="button"
        class="card cta"
        style={{ background: brandFill(config) }}
        onClick={() => store.go({ name: 'new' })}
      >
        <SendToSupportIcon size={18} />
        <span>{strings.sendToSupport}</span>
      </button>

      <button
        type="button"
        class="card"
        onClick={() => store.go({ name: 'conversations' })}
      >
        <InboxIcon size={18} />
        <span class="card-title">{strings.conversations}</span>
        <span class="card-meta">
          {inboxHasUnread && <UnreadDot />}
          <ChevronIcon size={16} />
        </span>
      </button>

      {config.modules.faqEnabled && <FaqSection />}
    </div>
  )
}

/** The help centre, grouped as the studio grouped it in the dashboard. */
function FaqSection() {
  const { store, strings } = useUi()
  const state = useWidgetState()
  if (state.faqs.length === 0) return null

  const byCategory = state.faqCategories
    .map((category) => ({
      category,
      faqs: state.faqs.filter((faq) => faq.categoryId === category.id),
    }))
    .filter((group) => group.faqs.length > 0)

  return (
    <section class="faq-section">
      <h2 class="section-title">{strings.faq}</h2>
      {byCategory.map(({ category, faqs }) => (
        <div key={category.id} class="faq-group">
          <p class="faq-category">{category.name}</p>
          {faqs.map((faq) => (
            <button
              key={faq.id}
              type="button"
              class="faq-row"
              onClick={() => store.go({ name: 'faq', faqId: faq.id })}
            >
              <span>{faq.question}</span>
              <ChevronIcon size={16} />
            </button>
          ))}
        </div>
      ))}
    </section>
  )
}

/**
 * The thread to tease on Home: the most recently active open one.
 *
 * Resolved and closed threads are deliberately out. Home is where a visitor
 * comes back to something in progress, and a settled conversation is not one.
 */
function mostRecentOpen(conversations: readonly Conversation[]): Conversation | null {
  let best: Conversation | null = null
  for (const conversation of conversations) {
    if (conversation.status !== 'open') continue
    const at = conversation.lastMessageAt ?? conversation.createdAt
    const bestAt = best ? (best.lastMessageAt ?? best.createdAt) : ''
    if (!best || at > bestAt) best = conversation
  }
  return best
}
