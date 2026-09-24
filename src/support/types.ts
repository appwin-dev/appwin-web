/**
 * The wire shapes of `/api/sdk/support/v1/**`.
 *
 * Hand-written rather than imported from `@app-win/contracts`, deliberately.
 * That package describes the whole backend, carries Zod at runtime and weighs
 * more than this entire SDK; shipping it to a studio's site to type six
 * endpoints would be absurd. ADR-0036 §5 has these generated from a versioned
 * OpenAPI spec in the end, and this file is what that codegen replaces.
 *
 * Until then the rule is: only what the SDK reads, and nothing renamed. A field
 * that is here must have the same name as on the wire, so the diff against the
 * server contract stays a matter of reading two files side by side.
 */

export type ConversationStatus = 'open' | 'resolved' | 'closed'
export type MessageAuthorType = 'customer' | 'organization_member' | 'ai_assistant'

/** Cursor page. `nextCursor === null` means there is nothing more to load. */
export interface CursorPage<T> {
  data: T[]
  nextCursor: string | null
  total?: number
}

export interface Attachment {
  id: string
  messageId: string
  filename: string
  mimeType: string
  sizeBytes: number
  /** Signed GET URL, re-signed on every read. Short lived, never persist it. */
  url: string
  createdAt: string
}

/** A media already uploaded to storage, handed back when sending a message. */
export interface AttachmentInput {
  storageKey: string
  mimeType: string
  sizeBytes: number
  filename: string
}

export interface MessageReaction {
  emoji: string
  count: number
  reactedByMe?: boolean
}

export interface Message {
  id: string
  conversationId: string
  authorType: MessageAuthorType
  authorId: string
  authorNameSnapshot: string | null
  /** Empty when the message carries only attachments. */
  body: string
  /** The body in the visitor's language, when the server translated it. */
  translatedBody: string | null
  sourceLanguage: string | null
  targetLanguage: string | null
  attachments: Attachment[]
  reactions: MessageReaction[]
  readAt: string | null
  createdAt: string
}

export interface Conversation {
  id: string
  projectId: string
  customerId: string
  preview: string | null
  lastMessageAuthorType: MessageAuthorType | null
  status: ConversationStatus
  lastMessageAt: string | null
  lastReadAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Faq {
  id: string
  categoryId: string
  question: string
  answer: string
  position: number
  pinned: boolean
}

export interface FaqCategory {
  id: string
  name: string
}

/* -------------------------------------------------------------------------- */
/* Messenger configuration                                                    */
/* -------------------------------------------------------------------------- */

export interface BrandingColors {
  primary: string
  primaryForeground: string
}

/** Feature switches the studio flips from the dashboard. */
export interface SdkModules {
  faqEnabled: boolean
  aiAutoReplyEnabled: boolean
}

export interface MessengerMessaging {
  agentName?: string
  avatarSource: 'project_logo' | 'custom'
  agentAvatarUrl?: string | null
  welcomeMessage?: string
  welcomeMessageEnabled: boolean
}

export interface MessengerDesign {
  autoGradient: boolean
  radius: 'low' | 'medium' | 'high' | 'max'
  bannerSource: 'preset' | 'custom' | 'none'
  presetBannerId: 'emojis' | 'amicale' | 'discret' | 'photo' | 'icon' | 'serious'
  bannerUrl?: string | null
  bannerFocusY: number
}

export interface MessengerContext {
  projectName: string
  projectLogoUrl: string | null
  agentName: string
  agentAvatarUrl: string | null
  /** Where the preset banner images are served from. */
  assetsBaseUrl: string
}

/**
 * Everything the UI needs to render itself, decided server side.
 *
 * `version` doubles as the cache key: the studio changing a colour bumps it,
 * and nothing else has to be invalidated by hand.
 */
export interface MessengerConfig {
  colors: BrandingColors
  modules: SdkModules
  messaging: MessengerMessaging
  design: MessengerDesign
  context: MessengerContext
  version: number
  updatedAt: string
}

/* -------------------------------------------------------------------------- */
/* Uploads                                                                    */
/* -------------------------------------------------------------------------- */

/** Pre-signed POST: the browser uploads straight to storage, not through us. */
export interface SignedUpload {
  uploadId: string
  storageKey: string
  postUrl: string
  fields: Record<string, string>
  expiresInSec: number
}
