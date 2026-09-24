/**
 * One conversation, and the composer under it.
 *
 * Also the screen for a thread that does not exist yet: the server refuses an
 * empty conversation, so "write us a message" is this same view with nothing
 * above the composer, and the first send creates the thread (see
 * `WidgetStore.send`).
 */

import { useEffect, useRef, useState } from 'preact/hooks'

import type { AttachmentInput, Message } from '../../support/types.ts'
import { useUi, useWidgetState } from './app.tsx'
import { AttachIcon, Avatar, FileIcon, SendToSupportIcon, Spinner } from './bits.tsx'
import { fileSize, groupByDay, timeOfDay } from './format.ts'
import { agentAvatarUrl, agentLabel } from './theme.ts'

/** Scrolling up past this many pixels from the top asks for older messages. */
const LOAD_OLDER_THRESHOLD_PX = 80

/** The same six as `QuickMessageReactions` on iOS, in the same order. */
const QUICK_REACTIONS = ['👍', '🔥', '❤️', '😂', '😮', '🎉']

export function ThreadScreen() {
  const { store, strings, locale } = useUi()
  const state = useWidgetState()
  const scroller = useRef<HTMLDivElement>(null)
  const thread = state.thread
  const config = state.config

  const lastMessageId = thread?.messages[0]?.id ?? null
  useEffect(() => {
    // A thread reads from the bottom, and a new message must not leave the
    // reader looking at the middle of the history.
    const element = scroller.current
    if (element) element.scrollTop = element.scrollHeight
  }, [lastMessageId, thread?.agentTyping])

  if (!config) return null

  const groups = thread ? groupByDay(thread.messages, strings, locale) : []
  const welcome = config.messaging.welcomeMessageEnabled
    ? config.messaging.welcomeMessage?.trim()
    : ''

  const onScroll = (): void => {
    const element = scroller.current
    if (!element || element.scrollTop > LOAD_OLDER_THRESHOLD_PX) return
    void store.loadOlder()
  }

  return (
    <div class="thread">
      <div class="thread-scroll" ref={scroller} onScroll={onScroll}>
        {thread?.loadingOlder && (
          <div class="centered thin">
            <Spinner />
          </div>
        )}

        {!thread && welcome && (
          <div class="thread-welcome">
            <Avatar name={agentLabel(config)} url={agentAvatarUrl(config)} size={32} />
            <p>{welcome}</p>
          </div>
        )}

        {groups.map((group) => (
          <div key={group.day} class="day">
            <p class="day-label">{group.day}</p>
            {group.messages.map((message) => (
              <Bubble key={message.id} message={message} />
            ))}
          </div>
        ))}

        {thread?.agentTyping && (
          <div class="typing" aria-label={strings.typing}>
            <span />
            <span />
            <span />
          </div>
        )}
      </div>

      <Composer />
    </div>
  )
}

function Bubble({ message }: { message: Message }) {
  const { store, locale, strings } = useUi()
  const state = useWidgetState()
  const [openActions, setOpenActions] = useState(false)
  const [showsOriginal, setShowsOriginal] = useState(false)
  const mine = message.authorType === 'customer'
  const config = state.config

  // The server translates a studio reply into the visitor's language; the
  // original stays on the message, one tap away, as on the native SDKs.
  const translated = message.translatedBody?.trim()
  const hasTranslation = !mine && !!translated && translated !== message.body
  const body = hasTranslation && !showsOriginal ? translated : message.body

  // Only the visitor's own messages, and only ones with a body: the server
  // refuses anything else, and a menu offering what will be refused is worse
  // than no menu.
  const canEdit = mine && !!message.body

  return (
    <div class={`bubble-row ${mine ? 'mine' : 'theirs'}`}>
      {!mine && config && (
        <Avatar
          name={message.authorNameSnapshot ?? agentLabel(config)}
          url={agentAvatarUrl(config)}
          size={24}
        />
      )}

      <div class="bubble-column">
        {openActions && (
          <div class="actions">
            <div class="pill">
              {QUICK_REACTIONS.map((emoji) => {
                const mineAlready = message.reactions.some((r) => r.emoji === emoji && r.reactedByMe)
                return (
                  <button
                    key={emoji}
                    type="button"
                    class={`pill-emoji ${mineAlready ? 'on' : ''}`}
                    onClick={() => {
                      setOpenActions(false)
                      void store.toggleReaction(message.id, emoji)
                    }}
                  >
                    {emoji}
                  </button>
                )
              })}
            </div>

            {canEdit && (
              <div class="pill">
                <button
                  type="button"
                  class="pill-action"
                  onClick={() => {
                    setOpenActions(false)
                    store.startEditing(message)
                  }}
                >
                  {strings.editMessage}
                </button>
                <button
                  type="button"
                  class="pill-action danger"
                  onClick={() => {
                    setOpenActions(false)
                    void store.deleteMessage(message.id)
                  }}
                >
                  {strings.deleteMessage}
                </button>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          class="bubble"
          aria-label={strings.react}
          onClick={() => setOpenActions((open) => !open)}
        >
          {body && <p class="bubble-body">{body}</p>}
          {message.attachments.map((attachment) => (
            <Attachment key={attachment.id} attachment={attachment} />
          ))}
          <span class="bubble-time">
            {timeOfDay(message.createdAt, locale)}
            {mine && message.readAt && ` · ${strings.seen}`}
          </span>
        </button>

        <div class="bubble-footer">
          {message.reactions.length > 0 && (
            <span class="reactions">
              {message.reactions.map((reaction) => (
                <button
                  key={reaction.emoji}
                  type="button"
                  class={`reaction ${reaction.reactedByMe ? 'on' : ''}`}
                  onClick={() => void store.toggleReaction(message.id, reaction.emoji)}
                >
                  {reaction.emoji}
                  {reaction.count > 1 && <span class="reaction-count">{reaction.count}</span>}
                </button>
              ))}
            </span>
          )}

          {hasTranslation && (
            <button
              type="button"
              class="link"
              onClick={() => setShowsOriginal((shown) => !shown)}
            >
              {showsOriginal ? strings.seeTranslation : strings.showOriginal}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Attachment({ attachment }: { attachment: Message['attachments'][number] }) {
  const { locale } = useUi()

  if (attachment.mimeType.startsWith('image/')) {
    return (
      <a class="attachment-image" href={attachment.url} target="_blank" rel="noreferrer noopener">
        <img src={attachment.url} alt={attachment.filename} loading="lazy" />
      </a>
    )
  }

  return (
    <a class="attachment-file" href={attachment.url} target="_blank" rel="noreferrer noopener">
      <FileIcon size={18} />
      <span class="attachment-name">{attachment.filename}</span>
      <span class="attachment-size">{fileSize(attachment.sizeBytes, locale)}</span>
    </a>
  )
}

/** Text, files, and the two ways to send. */
function Composer() {
  const { store, strings } = useUi()
  const state = useWidgetState()
  const [draft, setDraft] = useState('')
  const [pending, setPending] = useState<{ file: File; attachment: AttachmentInput | null }[]>([])
  const [uploading, setUploading] = useState(false)
  const input = useRef<HTMLTextAreaElement>(null)

  const grow = (): void => {
    const element = input.current
    if (!element) return
    // Auto-height, capped: a long message must not eat the whole thread.
    element.style.height = 'auto'
    element.style.height = `${Math.min(element.scrollHeight, 120)}px`
  }

  const editing = state.editing

  // Entering edit mode loads the message into the composer; leaving it puts
  // the draft back where it was, so a cancel costs the visitor nothing.
  const [draftBeforeEdit, setDraftBeforeEdit] = useState<string | null>(null)
  useEffect(() => {
    if (editing) {
      if (draftBeforeEdit === null) setDraftBeforeEdit(draft)
      setDraft(editing.original)
      input.current?.focus()
    } else if (draftBeforeEdit !== null) {
      setDraft(draftBeforeEdit)
      setDraftBeforeEdit(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing?.messageId])

  const submit = async (): Promise<void> => {
    if (editing) {
      await store.saveEdit(draft)
      return
    }

    const attachments = pending.map((item) => item.attachment).filter((a): a is AttachmentInput => !!a)
    if (!draft.trim() && attachments.length === 0) return
    setDraft('')
    setPending([])
    if (input.current) input.current.style.height = 'auto'
    await store.send(draft, attachments)
  }

  const attach = async (files: FileList | null): Promise<void> => {
    if (!files || files.length === 0) return
    setUploading(true)
    for (const file of Array.from(files)) {
      try {
        const attachment = await store.upload(file)
        setPending((current) => [...current, { file, attachment }])
      } catch {
        // A file that storage refused is simply not attached; the message
        // itself is unaffected and the visitor can send it anyway.
      }
    }
    setUploading(false)
  }

  return (
    <div class="composer">
      {editing && (
        <div class="composer-editing">
          <span>{strings.editingBanner}</span>
          <button type="button" class="link" onClick={() => store.cancelEditing()}>
            {strings.cancel}
          </button>
        </div>
      )}

      {pending.length > 0 && (
        <div class="composer-files">
          {pending.map((item, index) => (
            <span key={`${item.file.name}-${index}`} class="composer-file">
              <FileIcon size={14} />
              {item.file.name}
              <button
                type="button"
                class="composer-file-remove"
                aria-label={strings.close}
                onClick={() => setPending((current) => current.filter((_, i) => i !== index))}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {state.sendError && <p class="composer-error">{strings.loadErrorMessage}</p>}

      <div class="composer-row">
        {!editing && (
        <label class="icon-button" aria-label={strings.attachFile}>
          <AttachIcon />
          <input
            type="file"
            multiple
            hidden
            onChange={(event) => void attach((event.target as HTMLInputElement).files)}
          />
        </label>
        )}

        <textarea
          ref={input}
          class="composer-input"
          rows={1}
          placeholder={strings.messagePlaceholder}
          value={draft}
          onInput={(event) => {
            setDraft((event.target as HTMLTextAreaElement).value)
            grow()
            store.notifyTyping()
          }}
          onKeyDown={(event) => {
            // Enter sends, Shift+Enter breaks the line: what every messenger
            // does, and what a visitor will try first.
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              void submit()
            }
          }}
        />

        {/* Labelled capsule rather than a bare arrow, as the composer is on
            iOS: the button says what it does, and the paper plane is the same
            icon the studio saw in the dashboard's preview. */}
        <button
          type="button"
          class="send"
          disabled={
            state.sending || uploading || (!draft.trim() && (editing !== null || pending.length === 0))
          }
          onClick={() => void submit()}
        >
          <span>{editing ? strings.save : strings.send}</span>
          {state.sending || uploading ? <Spinner /> : <SendToSupportIcon size={14} />}
        </button>
      </div>
    </div>
  )
}
