/**
 * The messenger's state, with no view attached.
 *
 * The screens are a function of what is here and nothing else, which is what
 * lets the awkward parts - read receipts firing on the wrong thread, a typing
 * indicator that never clears, a send racing a refetch - be tested without a
 * browser. It mirrors the iOS stores (`ConversationStore`, `MessageStore`,
 * `FaqStore`) merged into one, because there is one panel and one screen at a
 * time.
 *
 * Every read goes back to the API. Realtime events say what changed, never
 * the content (ADR-0028 §2), so acting on one means refetching, and a dropped
 * frame costs a stale view rather than a wrong one.
 */

import type { SupportRealtimeEvent } from '../../support/realtime.ts'
import { hasUnread } from '../../support/client.ts'
import type { SupportClient } from '../../support/client.ts'
import type {
  AttachmentInput,
  Conversation,
  Faq,
  FaqCategory,
  Message,
  MessengerConfig,
} from '../../support/types.ts'

/** Cleared this long after the last typing frame, as the studio's client does. */
const TYPING_TIMEOUT_MS = 6_000

/** A `typing` call at most this often while the visitor writes. */
const TYPING_THROTTLE_MS = 2_000

export type Route =
  | { name: 'home' }
  | { name: 'conversations' }
  | { name: 'thread'; conversationId: string }
  /** Composing the first message: the thread does not exist until it is sent. */
  | { name: 'new' }
  | { name: 'faq'; faqId: string }

export interface ThreadState {
  conversationId: string
  messages: Message[]
  /** Cursor for older messages; `null` once the whole history is in. */
  cursor: string | null
  loadingOlder: boolean
  /** The studio is typing, never the visitor's own echo. */
  agentTyping: boolean
}

/** The message the composer is rewriting, if any. */
export interface EditingState {
  messageId: string
  /** The body as it was, so cancelling restores it. */
  original: string
}

export interface WidgetState {
  status: 'loading' | 'ready' | 'error'
  config: MessengerConfig | null
  route: Route
  conversations: Conversation[]
  faqs: Faq[]
  faqCategories: FaqCategory[]
  thread: ThreadState | null
  sending: boolean
  /** Last send failure, shown next to the composer rather than swallowed. */
  sendError: boolean
  editing: EditingState | null
}

export interface StoreDeps {
  client: SupportClient
  /** Wall clock, injectable so the tests are not at the mercy of one. */
  now?: () => number
}

const INITIAL: WidgetState = {
  status: 'loading',
  config: null,
  route: { name: 'home' },
  conversations: [],
  faqs: [],
  faqCategories: [],
  thread: null,
  sending: false,
  sendError: false,
  editing: null,
}

export class WidgetStore {
  private state: WidgetState = INITIAL
  private readonly listeners = new Set<() => void>()
  private readonly client: SupportClient
  private readonly now: () => number

  private typingTimer: ReturnType<typeof setTimeout> | null = null
  /** Far enough back that the first keystroke is never the throttled one. */
  private lastTypingSentAt = Number.NEGATIVE_INFINITY

  constructor(deps: StoreDeps) {
    this.client = deps.client
    this.now = deps.now ?? (() => Date.now())
  }

  getState(): WidgetState {
    return this.state
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /** How many threads the studio has replied in since the visitor last looked. */
  get unread(): number {
    return this.state.conversations.filter(hasUnread).length
  }

  private set(patch: Partial<WidgetState>): void {
    this.state = { ...this.state, ...patch }
    for (const listener of this.listeners) listener()
  }

  /**
   * First load. The config is the only blocking call: without it there is no
   * brand, no agent name and no idea which modules the studio turned on, so
   * there is nothing honest to paint.
   */
  async boot(): Promise<void> {
    try {
      const config = await this.client.config()
      this.set({ config, status: 'ready' })
    } catch {
      this.set({ status: 'error' })
      return
    }

    await Promise.all([this.refreshConversations(), this.loadFaqs()])
  }

  async refreshConversations(): Promise<void> {
    try {
      const page = await this.client.conversations()
      this.set({ conversations: page.data })
    } catch {
      // A stale list is better than an empty one: the visitor keeps the
      // threads they were looking at, and the next event tries again.
    }
  }

  /**
   * Another visitor now: the threads on screen are the previous one's, so they
   * go before the new list comes in, never alongside it.
   */
  async visitorChanged(): Promise<void> {
    this.clearTypingTimer()
    this.set({
      route: { name: 'home' },
      conversations: [],
      thread: null,
      sending: false,
      sendError: false,
      editing: null,
    })
    await this.refreshConversations()
  }

  private async loadFaqs(): Promise<void> {
    if (!this.state.config?.modules.faqEnabled) return
    try {
      const [faqs, faqCategories] = await Promise.all([
        this.client.faqs(),
        this.client.faqCategories(),
      ])
      this.set({ faqs, faqCategories })
    } catch {
      // The help centre simply does not show. It is not what the visitor came
      // for when something is already going wrong.
    }
  }

  go(route: Route): void {
    // Leaving a thread drops it: coming back refetches, which is also how the
    // list recovers from anything missed while elsewhere.
    if (route.name !== 'thread' && this.state.thread) {
      this.clearTypingTimer()
      this.set({ route, thread: null, sendError: false, editing: null })
      return
    }
    this.set({ route, sendError: false, editing: null })
  }

  /** Opens a thread, marks it read, and shows what we already had meanwhile. */
  async openThread(conversationId: string): Promise<void> {
    this.set({
      route: { name: 'thread', conversationId },
      thread: { conversationId, messages: [], cursor: null, loadingOlder: false, agentTyping: false },
      sendError: false,
      editing: null,
    })

    try {
      const page = await this.client.messages(conversationId)
      this.patchThread(conversationId, { messages: page.data, cursor: page.nextCursor })
    } catch {
      this.patchThread(conversationId, { messages: [] })
    }

    await this.markRead(conversationId)
  }

  /** Scrolling up. The list is newest first, so this appends to its tail. */
  async loadOlder(): Promise<void> {
    const thread = this.state.thread
    if (!thread || !thread.cursor || thread.loadingOlder) return

    this.patchThread(thread.conversationId, { loadingOlder: true })
    try {
      const page = await this.client.messages(thread.conversationId, thread.cursor)
      const current = this.state.thread
      if (!current || current.conversationId !== thread.conversationId) return
      this.patchThread(thread.conversationId, {
        messages: [...current.messages, ...page.data],
        cursor: page.nextCursor,
        loadingOlder: false,
      })
    } catch {
      this.patchThread(thread.conversationId, { loadingOlder: false })
    }
  }

  /**
   * Sends, from either composer.
   *
   * On the `new` route there is no thread yet, so this opens one: the server
   * refuses an empty conversation, which is why the first message and the
   * thread are created in a single call.
   */
  async send(body: string, attachments: AttachmentInput[] = []): Promise<void> {
    const text = body.trim()
    if (!text && attachments.length === 0) return
    if (this.state.sending) return

    this.set({ sending: true, sendError: false })
    const thread = this.state.thread

    try {
      if (!thread) {
        const conversation = await this.client.createConversation({ body: text, attachments })
        this.set({ sending: false })
        await this.openThread(conversation.id)
        void this.refreshConversations()
        return
      }

      const message = await this.client.sendMessage(thread.conversationId, {
        body: text,
        attachments,
      })
      void this.client.setTyping(thread.conversationId, false)
      const current = this.state.thread
      if (current?.conversationId === thread.conversationId) {
        // Newest first, so the fresh message goes to the head. Prepending
        // rather than refetching is what makes it appear without a round trip.
        this.patchThread(thread.conversationId, { messages: [message, ...current.messages] })
      }
      this.set({ sending: false })
      void this.refreshConversations()
    } catch {
      this.set({ sending: false, sendError: true })
    }
  }

  /** Uploads one file and hands back what `send` wants. */
  upload(file: File): Promise<AttachmentInput> {
    return this.client.upload(file)
  }

  /**
   * Puts a message of the visitor's own back into the composer.
   *
   * Only their own, and only one with a body: the server refuses anything
   * else (`SdkUpdateMessageUseCase`), and a menu offering what will be
   * refused is worse than no menu.
   */
  startEditing(message: Message): void {
    if (message.authorType !== 'customer' || !message.body) return
    this.set({ editing: { messageId: message.id, original: message.body }, sendError: false })
  }

  cancelEditing(): void {
    this.set({ editing: null })
  }

  /** Saves the rewrite. An empty body would be a deletion, so it is refused. */
  async saveEdit(body: string): Promise<void> {
    const editing = this.state.editing
    const thread = this.state.thread
    const text = body.trim()
    if (!editing || !thread || !text) return
    if (this.state.sending) return

    this.set({ sending: true, sendError: false })
    try {
      const updated = await this.client.updateMessage(thread.conversationId, editing.messageId, text)
      this.replaceMessage(thread.conversationId, updated)
      this.set({ sending: false, editing: null })
      void this.refreshConversations()
    } catch {
      this.set({ sending: false, sendError: true })
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    const thread = this.state.thread
    if (!thread) return

    try {
      await this.client.deleteMessage(thread.conversationId, messageId)
    } catch {
      this.set({ sendError: true })
      return
    }

    const current = this.state.thread
    if (current?.conversationId === thread.conversationId) {
      this.patchThread(thread.conversationId, {
        messages: current.messages.filter((message) => message.id !== messageId),
      })
    }
    // The deleted message may have been the one the thread list previews.
    void this.refreshConversations()
    if (this.state.editing?.messageId === messageId) this.set({ editing: null })
  }

  /**
   * Adds or removes one emoji on a message.
   *
   * The server answers with the message as it now stands, counts included, so
   * there is nothing to recompute here and no second read.
   */
  async toggleReaction(messageId: string, emoji: string): Promise<void> {
    const thread = this.state.thread
    if (!thread) return

    try {
      const updated = await this.client.toggleReaction(thread.conversationId, messageId, emoji)
      this.replaceMessage(thread.conversationId, updated)
    } catch {
      // A reaction that did not take is a reaction the visitor can try again.
    }
  }

  /** Swaps one message in place, keeping the rest of the thread untouched. */
  private replaceMessage(conversationId: string, message: Message): void {
    const thread = this.state.thread
    if (!thread || thread.conversationId !== conversationId) return
    this.patchThread(conversationId, {
      messages: thread.messages.map((current) => (current.id === message.id ? message : current)),
    })
  }

  /**
   * The visitor is writing.
   *
   * Throttled rather than debounced: the agent wants to see it start, not
   * find out once it has stopped. It is a courtesy, so a failure is silent
   * (`setTyping` swallows its own errors).
   */
  notifyTyping(): void {
    const thread = this.state.thread
    if (!thread) return

    const at = this.now()
    if (at - this.lastTypingSentAt < TYPING_THROTTLE_MS) return
    this.lastTypingSentAt = at
    void this.client.setTyping(thread.conversationId, true)
  }

  /** Reacts to the live socket. Nothing here trusts the payload for content. */
  onRealtime(event: SupportRealtimeEvent): void {
    if (event.type === 'typing') {
      const thread = this.state.thread
      if (!thread || thread.conversationId !== event.conversationId) return
      this.patchThread(thread.conversationId, { agentTyping: event.isTyping })
      this.clearTypingTimer()
      if (event.isTyping) {
        // A client that goes away mid-sentence sends no closing frame, and an
        // indicator left running says the agent is still there when they are not.
        this.typingTimer = setTimeout(() => {
          this.patchThread(event.conversationId, { agentTyping: false })
        }, TYPING_TIMEOUT_MS)
      }
      return
    }

    void this.refreshConversations()

    const thread = this.state.thread
    if (!thread) return
    if (event.type === 'conversation' && event.conversationId !== thread.conversationId) return
    void this.refreshOpenThread()
  }

  /** Refetches the open thread's first page, and clears its unread state. */
  private async refreshOpenThread(): Promise<void> {
    const thread = this.state.thread
    if (!thread) return

    try {
      const page = await this.client.messages(thread.conversationId)
      const current = this.state.thread
      if (!current || current.conversationId !== thread.conversationId) return
      // Only the first page is refreshed: older messages already loaded stay
      // below, and re-walking the history on every event would be absurd.
      const older = current.messages.filter(
        (message) => !page.data.some((fresh) => fresh.id === message.id),
      )
      const seen = new Set(page.data.map((m) => m.id))
      this.patchThread(thread.conversationId, {
        messages: [...page.data, ...older.filter((m) => !seen.has(m.id))],
      })
    } catch {
      return
    }

    await this.markRead(thread.conversationId)
  }

  private async markRead(conversationId: string): Promise<void> {
    try {
      await this.client.markRead(conversationId)
    } catch {
      return
    }
    // The badge is computed from the thread list, so it only drops once the
    // list knows. Refetching is what keeps the two from disagreeing.
    await this.refreshConversations()
  }

  /** Applies a patch to the open thread, and only if it is still that one. */
  private patchThread(conversationId: string, patch: Partial<ThreadState>): void {
    const thread = this.state.thread
    if (!thread || thread.conversationId !== conversationId) return
    this.set({ thread: { ...thread, ...patch } })
  }

  private clearTypingTimer(): void {
    if (this.typingTimer) clearTimeout(this.typingTimer)
    this.typingTimer = null
  }

  /** Stops the timers a closed panel has no use for. */
  dispose(): void {
    this.clearTypingTimer()
    this.listeners.clear()
  }
}
