interface HttpRequest {
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    path: string;
    /** Serialised as JSON. Absent for GET. */
    body?: unknown;
    /** Bearer token, when the route needs one. */
    token?: string | null;
    /** Extra headers, e.g. `X-Appwin-App-Id` on the unauthenticated init call. */
    headers?: Record<string, string>;
    signal?: AbortSignal;
    query?: Record<string, string | number | undefined>;
}

/**
 * Small persistent store, scoped to one App ID.
 *
 * Everything here is wrapped in try/catch and falls back to memory, because
 * `localStorage` is not optional-but-usually-there: Safari in private mode
 * throws on write, embedded webviews disable it outright, and a visitor can
 * block site data. A support widget that throws on load because it could not
 * remember a device id would be worse than one that forgets.
 *
 * The cost of the fallback is honest and bounded: the visitor is anonymous
 * again on the next page load, exactly as if they had cleared their data.
 */
interface AppwinStorage {
    get(key: string): string | null;
    set(key: string, value: string): void;
    remove(key: string): void;
}

interface SessionOptions {
    appId: string;
    baseUrl: string;
    storage: AppwinStorage;
    /** SDK version, reported so the dashboard can show what a visitor is running. */
    sdkVersion: string;
}
/**
 * Holds the bearer token and keeps it usable.
 *
 * Two things make this less trivial than it looks in a browser. A tab can stay
 * open for days, long enough for a token to be revoked from the dashboard or
 * rotated by another tab; and several tabs of the same site share one storage,
 * so they race to open sessions. Both come out as a 401 on some later call,
 * which is why the recovery lives here rather than in every caller.
 */
declare class Session {
    private token;
    private externalId;
    private device;
    /** In flight init, shared so concurrent callers do not each open a session. */
    private pending;
    private readonly options;
    constructor(options: SessionOptions);
    get deviceId(): string;
    /** A token, opening a session if there is none yet. */
    authenticate(): Promise<string>;
    /**
     * Attaches this browser to a user of the studio's own account.
     *
     * Rotates the session when the identity changes: the token carries the
     * identity server side, so keeping the old one would leave the conversation
     * attributed to whoever was here before. Calling it again with the same id
     * is free, which matters because a host app will call it on every page.
     */
    identify(externalId: string): Promise<void>;
    /**
     * Forgets the visitor: new device id on the next call, no thread carried
     * over. What a host app calls when its own user logs out, so that the next
     * person on a shared machine does not read the previous one's support.
     */
    reset(): void;
    /**
     * Runs an authenticated request, re-opening the session once on a 401.
     *
     * The retry is capped at one attempt and only for `unauthorized`: anything
     * else, including the 403 of an undeclared origin, is the studio's to fix and
     * looping on it would just bury the message.
     */
    fetch<T>(req: Omit<HttpRequest, 'token'>): Promise<T>;
    /** Opens a session, collapsing concurrent callers onto one request. */
    private open;
    private requestToken;
}

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
type ConversationStatus = 'open' | 'resolved' | 'closed';
type MessageAuthorType = 'customer' | 'organization_member' | 'ai_assistant';
/** Cursor page. `nextCursor === null` means there is nothing more to load. */
interface CursorPage<T> {
    data: T[];
    nextCursor: string | null;
    total?: number;
}
interface Attachment {
    id: string;
    messageId: string;
    filename: string;
    mimeType: string;
    sizeBytes: number;
    /** Signed GET URL, re-signed on every read. Short lived, never persist it. */
    url: string;
    createdAt: string;
}
/** A media already uploaded to storage, handed back when sending a message. */
interface AttachmentInput {
    storageKey: string;
    mimeType: string;
    sizeBytes: number;
    filename: string;
}
interface MessageReaction {
    emoji: string;
    count: number;
    reactedByMe?: boolean;
}
interface Message {
    id: string;
    conversationId: string;
    authorType: MessageAuthorType;
    authorId: string;
    authorNameSnapshot: string | null;
    /** Empty when the message carries only attachments. */
    body: string;
    /** The body in the visitor's language, when the server translated it. */
    translatedBody: string | null;
    sourceLanguage: string | null;
    targetLanguage: string | null;
    attachments: Attachment[];
    reactions: MessageReaction[];
    readAt: string | null;
    createdAt: string;
}
interface Conversation {
    id: string;
    projectId: string;
    customerId: string;
    preview: string | null;
    lastMessageAuthorType: MessageAuthorType | null;
    status: ConversationStatus;
    lastMessageAt: string | null;
    lastReadAt: string | null;
    createdAt: string;
    updatedAt: string;
}
interface Faq {
    id: string;
    categoryId: string;
    question: string;
    answer: string;
    position: number;
    pinned: boolean;
}
interface FaqCategory {
    id: string;
    name: string;
}
interface BrandingColors {
    primary: string;
    primaryForeground: string;
}
/** Feature switches the studio flips from the dashboard. */
interface SdkModules {
    faqEnabled: boolean;
    aiAutoReplyEnabled: boolean;
}
interface MessengerMessaging {
    agentName?: string;
    avatarSource: 'project_logo' | 'custom';
    agentAvatarUrl?: string | null;
    welcomeMessage?: string;
    welcomeMessageEnabled: boolean;
}
interface MessengerDesign {
    autoGradient: boolean;
    radius: 'low' | 'medium' | 'high' | 'max';
    bannerSource: 'preset' | 'custom' | 'none';
    presetBannerId: 'emojis' | 'amicale' | 'discret' | 'photo' | 'icon' | 'serious';
    bannerUrl?: string | null;
    bannerFocusY: number;
}
interface MessengerContext {
    projectName: string;
    projectLogoUrl: string | null;
    agentName: string;
    agentAvatarUrl: string | null;
    /** Where the preset banner images are served from. */
    assetsBaseUrl: string;
}
/**
 * Everything the UI needs to render itself, decided server side.
 *
 * `version` doubles as the cache key: the studio changing a colour bumps it,
 * and nothing else has to be invalidated by hand.
 */
interface MessengerConfig {
    colors: BrandingColors;
    modules: SdkModules;
    messaging: MessengerMessaging;
    design: MessengerDesign;
    context: MessengerContext;
    version: number;
    updatedAt: string;
}
/** Pre-signed POST: the browser uploads straight to storage, not through us. */
interface SignedUpload {
    uploadId: string;
    storageKey: string;
    postUrl: string;
    fields: Record<string, string>;
    expiresInSec: number;
}

interface SendMessageInput {
    body?: string;
    attachments?: AttachmentInput[];
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
declare class SupportClient {
    private readonly session;
    constructor(session: Session);
    /** Branding, copy and feature switches, decided by the studio's dashboard. */
    config(signal?: AbortSignal): Promise<MessengerConfig>;
    /** Published FAQ of the project, already translated into the visitor's language. */
    faqs(signal?: AbortSignal): Promise<Faq[]>;
    faqCategories(signal?: AbortSignal): Promise<FaqCategory[]>;
    /** This visitor's threads, most recently active first. */
    conversations(cursor?: string, signal?: AbortSignal): Promise<CursorPage<Conversation>>;
    /**
     * How many threads the studio has replied in since the visitor last looked.
     *
     * Reads the first page only, which is the badge's whole job: past twenty
     * unread threads the number stops meaning anything, and the widget shows
     * `9+` long before that.
     */
    unreadCount(signal?: AbortSignal): Promise<number>;
    conversation(id: string, signal?: AbortSignal): Promise<Conversation>;
    /**
     * Opens a thread. A first message is required, so there is no such thing as
     * an empty conversation sitting in the studio's inbox.
     */
    createConversation(firstMessage: SendMessageInput): Promise<Conversation>;
    /** Newest first, oldest last. Pass `nextCursor` to walk back through history. */
    messages(conversationId: string, cursor?: string, signal?: AbortSignal): Promise<CursorPage<Message>>;
    sendMessage(conversationId: string, input: SendMessageInput): Promise<Message>;
    /** Marks the studio's messages as seen, which is what puts "Read" in the inbox. */
    markRead(conversationId: string): Promise<void>;
    /** Ephemeral, not persisted: the agent sees the visitor typing. */
    setTyping(conversationId: string, isTyping: boolean): Promise<void>;
    toggleReaction(conversationId: string, messageId: string, emoji: string): Promise<Message>;
    updateMessage(conversationId: string, messageId: string, body: string): Promise<Message>;
    deleteMessage(conversationId: string, messageId: string): Promise<void>;
    /**
     * A fresh signed URL for an attachment.
     *
     * The URL handed back with a message expires, so a thread left open in a tab
     * has stale links by the time someone clicks one.
     */
    attachmentUrl(attachmentId: string): Promise<{
        url: string;
    }>;
    /**
     * Uploads a file and returns the reference to attach to a message.
     *
     * Three steps, because the bytes never pass through our API: we sign, the
     * browser POSTs straight to object storage, then we confirm. A studio's
     * visitor sending a 40 MB screen recording therefore costs us no bandwidth.
     */
    upload(file: File, signal?: AbortSignal): Promise<AttachmentInput>;
}

/**
 * Events the messenger reacts to. Anything else on the socket is ignored.
 *
 * `message` carries no conversation id, and that is not an omission: the server
 * sends a minimal payload whose `resourceId` is the MESSAGE id (ADR-0016), so
 * nobody downstream can tell which thread moved without asking. The native SDKs
 * answer it the same way, by refetching the conversation list.
 */
type SupportRealtimeEvent = {
    type: 'message';
} | {
    type: 'conversation';
    conversationId: string;
} | {
    type: 'typing';
    conversationId: string;
    isTyping: boolean;
};
interface RealtimeOptions {
    session: Session;
    /** Gateway origin, e.g. `wss://ws.appwin.io`. */
    gatewayUrl: string;
    onEvent: (event: SupportRealtimeEvent) => void;
    /** Told when the socket comes and goes, so the UI can refetch after a gap. */
    onConnectionChange?: (connected: boolean) => void;
}
/**
 * Live updates for the messenger.
 *
 * The realtime token lasts sixty seconds, far less than a browser tab, so it is
 * minted fresh on every connection attempt rather than held. That also makes
 * reconnection the only recovery path we need: expiry, sleep, network change
 * and a server rolling update all end the same way, in `reconnect`.
 *
 * Events carry no content, only what changed (ADR-0028 §2). The consumer
 * refetches over REST, which keeps one source of truth and means a dropped
 * frame costs a stale view until the next event, never a wrong one.
 */
declare class SupportRealtime {
    private socket;
    private attempts;
    private pingTimer;
    private retryTimer;
    private closed;
    private readonly options;
    constructor(options: RealtimeOptions);
    connect(): Promise<void>;
    /** Stops for good: no further reconnection, unlike a dropped socket. */
    disconnect(): void;
    private open;
    private onFrame;
    private startPing;
    private stopPing;
    private clearTimers;
    /**
     * Exponential backoff with jitter. The jitter is the point: a server restart
     * disconnects every visitor of every studio at once, and without it they all
     * come back in the same millisecond.
     */
    private scheduleReconnect;
}

/**
 * Errors the SDK raises.
 *
 * One class with a machine-readable `code`, rather than a class per case: a
 * studio branches on the code, and a hierarchy would only make `instanceof`
 * checks fail across bundlers that duplicate the module.
 */
type AppwinErrorCode = 
/** The declared origins do not include this page (see the dashboard, SDK tab). */
'origin_not_allowed'
/** Unknown or disabled App ID. */
 | 'unauthorized'
/** The server refused the payload. */
 | 'bad_request'
/** Asked for something that is not there, or no longer is. */
 | 'not_found'
/** Too many requests from this address. */
 | 'rate_limited'
/** The server failed. */
 | 'server_error'
/** The request never reached the server (offline, DNS, CORS). */
 | 'network'
/** The caller aborted. */
 | 'aborted';
declare class AppwinError extends Error {
    readonly code: AppwinErrorCode;
    /** HTTP status, when the failure came back from the server. */
    readonly status: number | null;
    constructor(code: AppwinErrorCode, message: string, status?: number | null);
    /** True while retrying could plausibly work. */
    get retryable(): boolean;
}

/** Kept in step with the other artefacts by `sdk/scripts/release.mjs`. */
declare const SDK_VERSION = "0.7.0";
interface AppwinOptions {
    /** The App ID of the project, from the dashboard's SDK tab. */
    appId: string;
    /**
     * Your own user's id, when they are signed in. Optional: an anonymous
     * visitor is a perfectly good customer, they just come back as a lead.
     */
    userId?: string;
    /** Override for self-hosted or staging setups. */
    apiUrl?: string;
    gatewayUrl?: string;
}
/**
 * Appwin Support, headless.
 *
 * This is the whole product without any interface, which is the layer the
 * widget is built on and the layer a studio uses when it wants its own
 * (ADR-0036 §4). Nothing here touches the DOM, so it runs in a worker, in a
 * test, or server side just as well as in a page.
 *
 * ```ts
 * const appwin = createAppwin({ appId: 'aaaa-...' })
 * const config = await appwin.support.config()
 * const { data } = await appwin.support.conversations()
 * ```
 */
interface Appwin {
    support: SupportClient;
    /**
     * Opens the live connection. Optional: every read works over REST without
     * it, and it is what a page that only shows an unread badge can skip.
     */
    connect(onEvent: (event: SupportRealtimeEvent) => void, onConnectionChange?: (connected: boolean) => void): SupportRealtime;
    /** Attaches this browser to one of your users. Safe to call on every page. */
    identify(userId: string): Promise<void>;
    /** Forgets the visitor. Call it when your own user signs out. */
    reset(): void;
}
declare function createAppwin(options: AppwinOptions): Appwin;

export { type Appwin, AppwinError, type AppwinErrorCode, type AppwinOptions, type Attachment, type AttachmentInput, type BrandingColors, type Conversation, type ConversationStatus, type CursorPage, type Faq, type FaqCategory, type Message, type MessageAuthorType, type MessageReaction, type MessengerConfig, type MessengerContext, type MessengerDesign, type MessengerMessaging, SDK_VERSION, type SdkModules, type SendMessageInput, type SignedUpload, SupportClient, SupportRealtime, type SupportRealtimeEvent, createAppwin };
