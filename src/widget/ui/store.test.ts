import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import type { SupportClient } from '../../support/client.ts'
import type {
  Conversation,
  CursorPage,
  Message,
  MessengerConfig,
} from '../../support/types.ts'
import { WidgetStore } from './store.ts'

/**
 * The store is where the messenger can be quietly wrong: a read receipt on the
 * thread the visitor just left, a typing indicator that never clears, a send
 * that lands in a thread closed in the meantime. None of it throws, and none
 * of it is visible in a screenshot, so it is tested here rather than there.
 */

function config(patch: Partial<MessengerConfig> = {}): MessengerConfig {
  return {
    colors: { primary: '#000000', primaryForeground: '#ffffff' },
    modules: { faqEnabled: true, aiAutoReplyEnabled: false },
    messaging: { avatarSource: 'project_logo', welcomeMessageEnabled: false },
    design: {
      autoGradient: false,
      radius: 'medium',
      bannerSource: 'none',
      presetBannerId: 'emojis',
      bannerFocusY: 50,
    },
    context: {
      projectName: 'Studio',
      projectLogoUrl: null,
      agentName: 'Support Studio',
      agentAvatarUrl: null,
      assetsBaseUrl: 'https://dashboard.test',
    },
    version: 1,
    updatedAt: '2026-09-22T10:00:00.000Z',
    ...patch,
  }
}

function conversation(patch: Partial<Conversation> = {}): Conversation {
  return {
    id: 'conv-1',
    projectId: 'proj-1',
    customerId: 'cust-1',
    preview: 'hello',
    lastMessageAuthorType: 'organization_member',
    status: 'open',
    lastMessageAt: '2026-09-22T10:00:00.000Z',
    lastReadAt: null,
    createdAt: '2026-09-22T09:00:00.000Z',
    updatedAt: '2026-09-22T10:00:00.000Z',
    ...patch,
  }
}

function message(id: string, patch: Partial<Message> = {}): Message {
  return {
    id,
    conversationId: 'conv-1',
    authorType: 'organization_member',
    authorId: 'agent-1',
    authorNameSnapshot: 'Agent',
    body: id,
    translatedBody: null,
    sourceLanguage: null,
    targetLanguage: null,
    attachments: [],
    reactions: [],
    readAt: null,
    createdAt: '2026-09-22T10:00:00.000Z',
    ...patch,
  }
}

function page<T>(data: T[], nextCursor: string | null = null): CursorPage<T> {
  return { data, nextCursor }
}

interface FakeClient extends SupportClient {
  calls: string[]
}

/** A request held open, to order two of them by hand. */
function gate(): { open: Promise<void>; release: () => void } {
  let release = (): void => {}
  const open = new Promise<void>((resolve) => {
    release = resolve
  })
  return { open, release }
}

/**
 * A client that records what it was asked, and answers what the test set.
 *
 * The recording wraps the overrides rather than being replaced by them: a test
 * that stubs `messages` still wants the call to show up in `calls`, and
 * forgetting that makes a store look like it never fetched anything.
 */
function fakeClient(overrides: Partial<Record<keyof SupportClient, unknown>> = {}): FakeClient {
  const calls: string[] = []
  const record = <A extends unknown[], R>(name: (...args: A) => string, fn: (...args: A) => R) =>
    (...args: A): R => {
      calls.push(name(...args))
      return fn(...args)
    }
  const base = {
    calls,
    config: async () => {
      return config()
    },
    faqs: async () => {
      return []
    },
    faqCategories: async () => {
      return []
    },
    conversations: async () => {
      return page<Conversation>([])
    },
    messages: async (id: string) => {
      return page<Message>([])
    },
    markRead: async (id: string) => {
    },
    createConversation: async () => {
      return conversation({ id: 'conv-new' })
    },
    sendMessage: async () => {
      return message('sent')
    },
    setTyping: async (id: string, isTyping: boolean) => {
    },
    updateMessage: async (_conversationId: string, id: string, body: string) => {
      return message(id, { body, authorType: 'customer' })
    },
    deleteMessage: async () => {},
    toggleReaction: async (_conversationId: string, id: string, emoji: string) => {
      return message(id, { reactions: [{ emoji, count: 1, reactedByMe: true }] })
    },
    ...overrides,
  }

  const wrapped = {
    ...base,
    config: record(() => 'config', base.config as () => Promise<MessengerConfig>),
    faqs: record(() => 'faqs', base.faqs as () => Promise<unknown>),
    faqCategories: record(() => 'faqCategories', base.faqCategories as () => Promise<unknown>),
    conversations: record(() => 'conversations', base.conversations as () => Promise<unknown>),
    messages: record((id: string) => `messages:${id}`, base.messages as (id: string) => Promise<unknown>),
    markRead: record((id: string) => `markRead:${id}`, base.markRead as (id: string) => Promise<void>),
    createConversation: record(() => 'createConversation', base.createConversation as () => Promise<Conversation>),
    sendMessage: record(() => 'sendMessage', base.sendMessage as () => Promise<Message>),
    setTyping: record(
      (id: string, isTyping: boolean) => `typing:${id}:${isTyping}`,
      base.setTyping as (id: string, isTyping: boolean) => Promise<void>,
    ),
    updateMessage: record(
      (_c: string, id: string, _body: string) => `updateMessage:${id}`,
      base.updateMessage as (c: string, id: string, body: string) => Promise<Message>,
    ),
    deleteMessage: record(
      (_c: string, id: string) => `deleteMessage:${id}`,
      base.deleteMessage as (c: string, id: string) => Promise<void>,
    ),
    toggleReaction: record(
      (_c: string, id: string, emoji: string) => `reaction:${id}:${emoji}`,
      base.toggleReaction as (c: string, id: string, emoji: string) => Promise<Message>,
    ),
  }
  return wrapped as unknown as FakeClient
}

describe('boot', () => {
  it('paints nothing when the configuration cannot be read', async () => {
    // The colours, the agent name and the enabled modules all come from it,
    // so there is nothing honest to show without it.
    const client = fakeClient({
      config: async () => {
        throw new Error('offline')
      },
    })
    const store = new WidgetStore({ client })
    await store.boot()

    assert.equal(store.getState().status, 'error')
    assert.equal(store.getState().config, null)
    assert.ok(!client.calls.includes('conversations'))
  })

  it('leaves the help centre alone when the studio turned it off', async () => {
    const client = fakeClient({
      config: async () => config({ modules: { faqEnabled: false, aiAutoReplyEnabled: false } }),
    })
    const store = new WidgetStore({ client })
    await store.boot()

    assert.equal(store.getState().status, 'ready')
    assert.ok(!client.calls.includes('faqs'))
  })

  it('keeps the threads it has when a refresh fails', async () => {
    let first = true
    const client = fakeClient({
      conversations: async () => {
        if (first) {
          first = false
          return page([conversation()])
        }
        throw new Error('offline')
      },
    })
    const store = new WidgetStore({ client })
    await store.boot()
    await store.refreshConversations()

    assert.equal(store.getState().conversations.length, 1)
  })
})

describe('unread', () => {
  it('counts only what the studio wrote since the visitor last looked', async () => {
    const client = fakeClient({
      conversations: async () =>
        page([
          conversation({ id: 'a', lastReadAt: null }),
          conversation({ id: 'b', lastMessageAuthorType: 'customer' }),
          conversation({
            id: 'c',
            lastReadAt: '2026-09-22T11:00:00.000Z',
            lastMessageAt: '2026-09-22T10:00:00.000Z',
          }),
          conversation({
            id: 'd',
            lastReadAt: '2026-09-22T09:00:00.000Z',
            lastMessageAt: '2026-09-22T10:00:00.000Z',
          }),
        ]),
    })
    const store = new WidgetStore({ client })
    await store.boot()

    // `a` never read, `d` answered after the last read. `b` is the visitor's
    // own message and `c` was read after it arrived.
    assert.equal(store.unread, 2)
  })
})

describe('opening a thread', () => {
  it('marks it read, then refreshes the list the badge is computed from', async () => {
    const client = fakeClient({ messages: async () => page([message('m1')]) })
    const store = new WidgetStore({ client })
    await store.boot()
    client.calls.length = 0

    await store.openThread('conv-1')

    assert.deepEqual(client.calls, ['messages:conv-1', 'markRead:conv-1', 'conversations'])
    assert.equal(store.getState().thread?.messages.length, 1)
  })

  it('drops the thread on the way out', async () => {
    const store = new WidgetStore({ client: fakeClient() })
    await store.boot()
    await store.openThread('conv-1')
    store.go({ name: 'home' })

    assert.equal(store.getState().thread, null)
  })

  it('ignores a page that lands after the visitor moved on', async () => {
    // Two taps in a row: the first request must not overwrite the second
    // thread's messages when it finally answers.
    const slowRequest = gate()
    const client = fakeClient({
      messages: async (id: string) => {
        if (id === 'slow') {
          await slowRequest.open
          return page([message('from-slow')])
        }
        return page([message('from-fast')])
      },
    })
    const store = new WidgetStore({ client })
    await store.boot()

    const slow = store.openThread('slow')
    await store.openThread('fast')
    slowRequest.release()
    await slow

    assert.equal(store.getState().thread?.conversationId, 'fast')
    assert.deepEqual(
      store.getState().thread?.messages.map((m) => m.id),
      ['from-fast'],
    )
  })
})

describe('sending', () => {
  it('opens a thread with the first message, since an empty one is refused', async () => {
    const client = fakeClient()
    const store = new WidgetStore({ client })
    await store.boot()
    store.go({ name: 'new' })
    client.calls.length = 0

    await store.send('Hello there')

    assert.ok(client.calls.includes('createConversation'))
    assert.equal(store.getState().thread?.conversationId, 'conv-new')
    assert.equal(store.getState().route.name, 'thread')
  })

  it('shows the message without waiting for a refetch', async () => {
    const client = fakeClient()
    const store = new WidgetStore({ client })
    await store.boot()
    await store.openThread('conv-1')

    await store.send('Second')

    assert.deepEqual(
      store.getState().thread?.messages.map((m) => m.id),
      ['sent'],
    )
    // Typing stops with the message: an indicator left running says the
    // visitor is still writing when they have just sent.
    assert.ok(client.calls.includes('typing:conv-1:false'))
  })

  it('refuses to send nothing, and says so when a send fails', async () => {
    const client = fakeClient({
      sendMessage: async () => {
        throw new Error('offline')
      },
    })
    const store = new WidgetStore({ client })
    await store.boot()
    await store.openThread('conv-1')
    client.calls.length = 0

    await store.send('   ')
    assert.deepEqual(client.calls, [])

    await store.send('Hello')
    assert.equal(store.getState().sendError, true)
    assert.equal(store.getState().sending, false)
  })
})

describe('typing', () => {
  it('tells the agent it started, not that it stopped', async () => {
    // Throttled, not debounced: the point is the agent seeing it early.
    let clock = 0
    const client = fakeClient()
    const store = new WidgetStore({ client, now: () => clock })
    await store.boot()
    await store.openThread('conv-1')
    client.calls.length = 0

    store.notifyTyping()
    clock += 500
    store.notifyTyping()
    clock += 3_000
    store.notifyTyping()

    assert.deepEqual(client.calls, ['typing:conv-1:true', 'typing:conv-1:true'])
  })

  it('only shows the indicator for the thread on screen', async () => {
    const store = new WidgetStore({ client: fakeClient() })
    await store.boot()
    await store.openThread('conv-1')

    store.onRealtime({ type: 'typing', conversationId: 'other', isTyping: true })
    assert.equal(store.getState().thread?.agentTyping, false)

    store.onRealtime({ type: 'typing', conversationId: 'conv-1', isTyping: true })
    assert.equal(store.getState().thread?.agentTyping, true)

    store.onRealtime({ type: 'typing', conversationId: 'conv-1', isTyping: false })
    assert.equal(store.getState().thread?.agentTyping, false)
    store.dispose()
  })
})

describe('live events', () => {
  it('refetches rather than trusting the payload', async () => {
    // Events carry what changed, never the content (ADR-0028 §2).
    const client = fakeClient({ messages: async () => page([message('m1')]) })
    const store = new WidgetStore({ client })
    await store.boot()
    await store.openThread('conv-1')
    client.calls.length = 0

    store.onRealtime({ type: 'message' })
    await new Promise((resolve) => setTimeout(resolve, 0))

    assert.ok(client.calls.includes('conversations'))
    assert.ok(client.calls.includes('messages:conv-1'))
    // A message arriving while the thread is open is read on arrival.
    assert.ok(client.calls.includes('markRead:conv-1'))
  })

  it('does not disturb the open thread for a change in another one', async () => {
    const client = fakeClient()
    const store = new WidgetStore({ client })
    await store.boot()
    await store.openThread('conv-1')
    client.calls.length = 0

    store.onRealtime({ type: 'conversation', conversationId: 'somewhere-else' })
    await new Promise((resolve) => setTimeout(resolve, 0))

    assert.ok(client.calls.includes('conversations'))
    assert.ok(!client.calls.includes('messages:conv-1'))
  })
})

describe('editing a message', () => {
  it('refuses what the server would refuse', async () => {
    // The SDK endpoint only lets the visitor rewrite their own message, and
    // only one with a body. Offering the menu anyway would put an error
    // behind a button rather than in front of it.
    const store = new WidgetStore({ client: fakeClient() })
    await store.boot()
    await store.openThread('conv-1')

    store.startEditing(message('m1', { authorType: 'organization_member' }))
    assert.equal(store.getState().editing, null)

    store.startEditing(message('m2', { authorType: 'customer', body: '' }))
    assert.equal(store.getState().editing, null)

    store.startEditing(message('m3', { authorType: 'customer', body: 'typo' }))
    assert.deepEqual(store.getState().editing, { messageId: 'm3', original: 'typo' })
  })

  it('swaps the message in place, and never an empty body', async () => {
    const client = fakeClient({ messages: async () => page([message('m1', { authorType: 'customer', body: 'teh' })]) })
    const store = new WidgetStore({ client })
    await store.boot()
    await store.openThread('conv-1')
    store.startEditing(message('m1', { authorType: 'customer', body: 'teh' }))
    client.calls.length = 0

    // An empty rewrite is a deletion in disguise; it has its own button.
    await store.saveEdit('   ')
    assert.equal(client.calls.length, 0)
    assert.notEqual(store.getState().editing, null)

    await store.saveEdit('the')
    assert.ok(client.calls.includes('updateMessage:m1'))
    assert.equal(store.getState().thread?.messages[0]?.body, 'the')
    assert.equal(store.getState().editing, null)
  })

  it('drops an edit in progress when the thread is left', async () => {
    const store = new WidgetStore({ client: fakeClient() })
    await store.boot()
    await store.openThread('conv-1')
    store.startEditing(message('m1', { authorType: 'customer', body: 'draft' }))

    store.go({ name: 'home' })
    assert.equal(store.getState().editing, null)
  })
})

describe('deleting a message', () => {
  it('takes it out of the thread and refreshes the list it previews', async () => {
    const client = fakeClient({
      messages: async () => page([message('m1', { authorType: 'customer' }), message('m2')]),
    })
    const store = new WidgetStore({ client })
    await store.boot()
    await store.openThread('conv-1')
    client.calls.length = 0

    await store.deleteMessage('m1')

    assert.ok(client.calls.includes('deleteMessage:m1'))
    assert.deepEqual(
      store.getState().thread?.messages.map((m) => m.id),
      ['m2'],
    )
    // The deleted message may have been the thread's preview in the inbox.
    assert.ok(client.calls.includes('conversations'))
  })

  it('leaves the thread alone when the server refuses', async () => {
    const client = fakeClient({
      messages: async () => page([message('m1', { authorType: 'customer' })]),
      deleteMessage: async () => {
        throw new Error('forbidden')
      },
    })
    const store = new WidgetStore({ client })
    await store.boot()
    await store.openThread('conv-1')

    await store.deleteMessage('m1')

    assert.equal(store.getState().thread?.messages.length, 1)
    assert.equal(store.getState().sendError, true)
  })
})

describe('reactions', () => {
  it('takes the counts from the answer rather than recomputing them', async () => {
    const client = fakeClient({ messages: async () => page([message('m1')]) })
    const store = new WidgetStore({ client })
    await store.boot()
    await store.openThread('conv-1')

    await store.toggleReaction('m1', '🔥')

    assert.ok(client.calls.includes('reaction:m1:🔥'))
    assert.deepEqual(store.getState().thread?.messages[0]?.reactions, [
      { emoji: '🔥', count: 1, reactedByMe: true },
    ])
  })
})
