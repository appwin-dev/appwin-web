/**
 * The visitor's threads, most recently active first.
 *
 * One row per conversation, the way the studio's own inbox lists them, minus
 * everything a visitor has no use for: no assignee, no tags, no status filter.
 */

import { hasUnread } from '../../support/client.ts'
import { useUi, useWidgetState } from './app.tsx'
import { MessageIcon, UnreadDot } from './bits.tsx'
import { conversationPreview, relativeTime } from './format.ts'

export function ConversationsScreen() {
  const { store, strings, locale } = useUi()
  const state = useWidgetState()

  if (state.conversations.length === 0) {
    return (
      <div class="screen empty">
        <MessageIcon size={28} />
        <p class="empty-title">{strings.noConversation}</p>
        <p class="empty-body">{strings.emptyConversationsHint}</p>
        <button type="button" class="button" onClick={() => store.go({ name: 'new' })}>
          {strings.sendToSupport}
        </button>
      </div>
    )
  }

  return (
    <div class="screen list">
      {state.conversations.map((conversation) => (
        <button
          key={conversation.id}
          type="button"
          class="row"
          onClick={() => void store.openThread(conversation.id)}
        >
          <div class="row-text">
            <span class="row-preview">{conversationPreview(conversation, strings)}</span>
            {conversation.status !== 'open' && (
              <span class="badge-status">
                {conversation.status === 'resolved' ? strings.statusResolved : strings.statusClosed}
              </span>
            )}
          </div>
          <span class="card-meta">
            {hasUnread(conversation) && <UnreadDot />}
            {conversation.lastMessageAt && relativeTime(conversation.lastMessageAt, strings, locale)}
          </span>
        </button>
      ))}
      <button type="button" class="card cta" onClick={() => store.go({ name: 'new' })}>
        <MessageIcon size={18} />
        <span>{strings.sendToSupport}</span>
      </button>
    </div>
  )
}
