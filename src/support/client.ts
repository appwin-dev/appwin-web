import type { Session } from '../core/session.ts'
import { AppwinError } from '../core/errors.ts'
import type {
  Attachment,
  AttachmentInput,
  Conversation,
  CursorPage,
  Faq,
  FaqCategory,
  Message,
  MessengerConfig,
  SignedUpload,
} from './types.ts'

const BASE = '/api/sdk/support/v1'

/** Page size for threads and message history. Matches what the native SDKs ask for. */
const PAGE_SIZE = 20

export interface SendMessageInput {
  body?: string
  attachments?: AttachmentInput[]
}

/**
 * The headless Support API.
 *
 * This is the whole product without a single pixel: a studio that wants its own
 * interface uses exactly this, and our widget is only its first consumer
 * (ADR-0036 §4). Which is also the rule that keeps the UI honest, since it can
 * reach nothing this class does not expose.
 *
 * Every call goes through `Session.fetch`, so a revoked or rotated token is
 * recovered once and invisibly.
 */
export class SupportClient {
  private readonly session: Session

  constructor(session: Session) {
    this.session = session
  }

  /** Branding, copy and feature switches, decided by the studio's dashboard. */
  config(signal?: AbortSignal): Promise<MessengerConfig> {
    return this.session.fetch<MessengerConfig>({
      method: 'GET',
      path: `${BASE}/config`,
      ...(signal ? { signal } : {}),
    })
  }

  /** Published FAQ of the project, already translated into the visitor's language. */
  faqs(signal?: AbortSignal): Promise<Faq[]> {
    return this.session.fetch<Faq[]>({
      method: 'GET',
      path: `${BASE}/faqs`,
      ...(signal ? { signal } : {}),
    })
  }

  faqCategories(signal?: AbortSignal): Promise<FaqCategory[]> {
    return this.session.fetch<FaqCategory[]>({
      method: 'GET',
      path: `${BASE}/faq-categories`,
      ...(signal ? { signal } : {}),
    })
  }

  /** This visitor's threads, most recently active first. */
  conversations(cursor?: string, signal?: AbortSignal): Promise<CursorPage<Conversation>> {
    return this.session.fetch<CursorPage<Conversation>>({
      method: 'GET',
      path: `${BASE}/conversations`,
      query: { limit: PAGE_SIZE, ...(cursor ? { cursor } : {}) },
      ...(signal ? { signal } : {}),
    })
  }

  /**
   * How many threads the studio has replied in since the visitor last looked.
   *
   * Reads the first page only, which is the badge's whole job: past twenty
   * unread threads the number stops meaning anything, and the widget shows
   * `9+` long before that.
   */
  async unreadCount(signal?: AbortSignal): Promise<number> {
    const page = await this.conversations(undefined, signal)
    return page.data.filter(hasUnread).length
  }

  conversation(id: string, signal?: AbortSignal): Promise<Conversation> {
    return this.session.fetch<Conversation>({
      method: 'GET',
      path: `${BASE}/conversations/${id}`,
      ...(signal ? { signal } : {}),
    })
  }

  /**
   * Opens a thread. A first message is required, so there is no such thing as
   * an empty conversation sitting in the studio's inbox.
   */
  createConversation(firstMessage: SendMessageInput): Promise<Conversation> {
    return this.session.fetch<Conversation>({
      method: 'POST',
      path: `${BASE}/conversations`,
      body: { firstMessage: normalizeMessage(firstMessage) },
    })
  }

  /** Newest first, oldest last. Pass `nextCursor` to walk back through history. */
  messages(
    conversationId: string,
    cursor?: string,
    signal?: AbortSignal,
  ): Promise<CursorPage<Message>> {
    return this.session.fetch<CursorPage<Message>>({
      method: 'GET',
      path: `${BASE}/conversations/${conversationId}/messages`,
      query: { limit: PAGE_SIZE, ...(cursor ? { cursor } : {}) },
      ...(signal ? { signal } : {}),
    })
  }

  sendMessage(conversationId: string, input: SendMessageInput): Promise<Message> {
    return this.session.fetch<Message>({
      method: 'POST',
      path: `${BASE}/conversations/${conversationId}/messages`,
      body: normalizeMessage(input),
    })
  }

  /** Marks the studio's messages as seen, which is what puts "Read" in the inbox. */
  markRead(conversationId: string): Promise<void> {
    return this.session.fetch<void>({
      method: 'POST',
      path: `${BASE}/conversations/${conversationId}/messages/read`,
    })
  }

  /** Ephemeral, not persisted: the agent sees the visitor typing. */
  async setTyping(conversationId: string, isTyping: boolean): Promise<void> {
    try {
      await this.session.fetch<void>({
        method: 'POST',
        path: `${BASE}/conversations/${conversationId}/typing`,
        body: { isTyping },
      })
    } catch {
      // A typing indicator is never worth surfacing an error for. It is a
      // courtesy, and the message itself is unaffected.
    }
  }

  toggleReaction(conversationId: string, messageId: string, emoji: string): Promise<Message> {
    return this.session.fetch<Message>({
      method: 'POST',
      path: `${BASE}/conversations/${conversationId}/messages/${messageId}/reactions`,
      body: { emoji },
    })
  }

  updateMessage(conversationId: string, messageId: string, body: string): Promise<Message> {
    return this.session.fetch<Message>({
      method: 'PATCH',
      path: `${BASE}/conversations/${conversationId}/messages/${messageId}`,
      body: { body },
    })
  }

  deleteMessage(conversationId: string, messageId: string): Promise<void> {
    return this.session.fetch<void>({
      method: 'DELETE',
      path: `${BASE}/conversations/${conversationId}/messages/${messageId}`,
    })
  }

  /**
   * A fresh signed URL for an attachment.
   *
   * The URL handed back with a message expires, so a thread left open in a tab
   * has stale links by the time someone clicks one.
   */
  attachmentUrl(attachmentId: string): Promise<{ url: string }> {
    return this.session.fetch<{ url: string }>({
      method: 'GET',
      path: `${BASE}/attachments/${attachmentId}/url`,
    })
  }

  /**
   * Uploads a file and returns the reference to attach to a message.
   *
   * Three steps, because the bytes never pass through our API: we sign, the
   * browser POSTs straight to object storage, then we confirm. A studio's
   * visitor sending a 40 MB screen recording therefore costs us no bandwidth.
   */
  async upload(file: File, signal?: AbortSignal): Promise<AttachmentInput> {
    const signed = await this.session.fetch<SignedUpload>({
      method: 'POST',
      path: `${BASE}/uploads/sign`,
      body: { mimeType: file.type || 'application/octet-stream', sizeBytes: file.size },
      ...(signal ? { signal } : {}),
    })

    const form = new FormData()
    for (const [key, value] of Object.entries(signed.fields)) form.append(key, value)
    // Last, as S3 requires: everything after the file field is ignored.
    form.append('file', file)

    let response: Response
    try {
      response = await fetch(signed.postUrl, {
        method: 'POST',
        body: form,
        ...(signal ? { signal } : {}),
      })
    } catch {
      throw new AppwinError('network', 'Could not reach the storage service')
    }
    if (!response.ok) {
      // The signature encodes the content type and a size range, so a refusal
      // here is usually a file that does not match what we asked to sign.
      throw new AppwinError('bad_request', 'The file was rejected by storage', response.status)
    }

    await this.session.fetch<unknown>({
      method: 'POST',
      path: `${BASE}/uploads/${signed.uploadId}/confirm`,
    })

    return {
      storageKey: signed.storageKey,
      mimeType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
      filename: file.name,
    }
  }
}

/**
 * Whether the studio wrote after the visitor last read the thread.
 *
 * Same rule as the native SDKs (`Conversation.hasUnread` on iOS): the
 * visitor's own message never lights the badge, and a thread never read is
 * unread only if the studio spoke in it.
 */
export function hasUnread(conversation: Conversation): boolean {
  if (conversation.lastMessageAuthorType === null) return false
  if (conversation.lastMessageAuthorType === 'customer') return false
  if (!conversation.lastMessageAt) return false
  if (!conversation.lastReadAt) return true
  return new Date(conversation.lastMessageAt) > new Date(conversation.lastReadAt)
}

/** The server wants both keys present, and refuses a message that is empty of both. */
function normalizeMessage(input: SendMessageInput): { body: string; attachments: AttachmentInput[] } {
  return { body: input.body?.trim() ?? '', attachments: input.attachments ?? [] }
}

export type { Attachment }
