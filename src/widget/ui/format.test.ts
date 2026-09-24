import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { widgetStrings } from '../strings.ts'
import { darkenHex } from './theme.ts'
import {
  conversationPreview,
  dayLabel,
  fileSize,
  groupByDay,
  initials,
  relativeTime,
} from './format.ts'
import type { Conversation, Message } from '../../support/types.ts'

const EN = widgetStrings('en')
const FR = widgetStrings('fr')

/** 2026-09-22, 15:00 local: the clock every case below is written against. */
const NOW = new Date(2026, 8, 22, 15, 0, 0).getTime()

function at(offsetMs: number): string {
  return new Date(NOW - offsetMs).toISOString()
}

describe('relative time', () => {
  it('climbs the same ladder as the native SDKs', () => {
    assert.equal(relativeTime(at(5_000), EN, 'en', NOW), 'Just now')
    assert.equal(relativeTime(at(4 * 60_000), EN, 'en', NOW), '4 min')
    assert.equal(relativeTime(at(3 * 3_600_000), EN, 'en', NOW), '3 h')
    assert.equal(relativeTime(at(2 * 86_400_000), EN, 'en', NOW), '2 d')
    assert.equal(relativeTime(at(9 * 86_400_000), EN, 'en', NOW), '1 w')
  })

  it('falls back to the date once the distance stops meaning anything', () => {
    // Past a month, "6 w" tells a reader less than the day itself.
    const formatted = relativeTime(at(60 * 86_400_000), EN, 'en', NOW)
    assert.match(formatted, /Jul/)
  })

  it('speaks the visitor language, not ours', () => {
    assert.equal(relativeTime(at(5_000), FR, 'fr', NOW), "À l'instant")
    assert.equal(relativeTime(at(2 * 86_400_000), FR, 'fr', NOW), '2 j')
  })

  it('never reads a clock skew as the future', () => {
    // A server a few seconds ahead of the browser is ordinary, and "in -3 min"
    // is not something to put in an inbox.
    assert.equal(relativeTime(at(-3 * 60_000), EN, 'en', NOW), 'Just now')
    assert.equal(relativeTime('not a date', EN, 'en', NOW), '')
  })
})

describe('day separators', () => {
  it('names today and yesterday rather than dating them', () => {
    assert.equal(dayLabel(at(2 * 3_600_000), EN, 'en', NOW), 'Today')
    assert.equal(dayLabel(at(20 * 3_600_000), EN, 'en', NOW), 'Yesterday')
  })

  it('counts calendar days, not elapsed hours', () => {
    // 01:00 today and 23:00 yesterday are two hours apart and two days.
    const now = new Date(2026, 8, 22, 1, 0, 0).getTime()
    const lateYesterday = new Date(2026, 8, 21, 23, 0, 0).toISOString()
    assert.equal(dayLabel(lateYesterday, EN, 'en', now), 'Yesterday')
  })

  it('adds the year only when it is not this one', () => {
    assert.match(dayLabel(new Date(2026, 2, 12).toISOString(), EN, 'en', NOW), /^12 March$|^March 12$/)
    assert.match(dayLabel(new Date(2024, 2, 12).toISOString(), EN, 'en', NOW), /2024/)
  })
})

function message(id: string, createdAt: string): Message {
  return {
    id,
    conversationId: 'conv-1',
    authorType: 'customer',
    authorId: 'cust-1',
    authorNameSnapshot: null,
    body: id,
    translatedBody: null,
    sourceLanguage: null,
    targetLanguage: null,
    attachments: [],
    reactions: [],
    readAt: null,
    createdAt,
  }
}

describe('grouping a thread', () => {
  it('turns the API order into reading order', () => {
    // The API pages backwards through history, so it answers newest first; a
    // thread reads downwards. Getting this wrong shows the conversation
    // upside down, which no test of the components would have caught.
    const groups = groupByDay(
      [
        message('c', at(1 * 3_600_000)),
        message('b', at(3 * 3_600_000)),
        message('a', at(26 * 3_600_000)),
      ],
      EN,
      'en',
      NOW,
    )

    assert.deepEqual(
      groups.map((group) => [group.day, group.messages.map((m) => m.id)]),
      [
        ['Yesterday', ['a']],
        ['Today', ['b', 'c']],
      ],
    )
  })

  it('holds on an empty thread', () => {
    assert.deepEqual(groupByDay([], EN, 'en', NOW), [])
  })
})

function conversation(patch: Partial<Conversation>): Conversation {
  return {
    id: 'conv-1',
    projectId: 'proj-1',
    customerId: 'cust-1',
    preview: null,
    lastMessageAuthorType: null,
    status: 'open',
    lastMessageAt: null,
    lastReadAt: null,
    createdAt: at(0),
    updatedAt: at(0),
    ...patch,
  }
}

describe('thread preview', () => {
  it('says who spoke last', () => {
    assert.equal(
      conversationPreview(
        conversation({ preview: 'Where is my order?', lastMessageAuthorType: 'customer' }),
        EN,
      ),
      'You: Where is my order?',
    )
    assert.equal(
      conversationPreview(
        conversation({ preview: 'On its way!', lastMessageAuthorType: 'organization_member' }),
        EN,
      ),
      'On its way!',
    )
  })

  it('names a thread that has no preview yet', () => {
    assert.equal(conversationPreview(conversation({ preview: '   ' }), EN), 'New conversation')
  })
})

describe('small formats', () => {
  it('reads initials by grapheme, not by code unit', () => {
    assert.equal(initials('Fitness Camp'), 'FC')
    assert.equal(initials('  spaced   out  '), 'SO')
    // Half a surrogate pair renders as a replacement character.
    assert.equal(initials('🪐 Saturn'), '🪐S')
    assert.equal(initials(''), '')
  })

  it('writes file sizes for a reader', () => {
    assert.equal(fileSize(512, 'en'), '512 B')
    assert.equal(fileSize(2_400, 'en'), '2.4 kB')
    assert.equal(fileSize(4_500_000, 'en'), '4.5 MB')
    // Past ten of a unit the decimal stops earning its place.
    assert.equal(fileSize(42_500_000, 'en'), '43 MB')
    assert.equal(fileSize(-1, 'en'), '0 B')
  })
})

describe('brand shades', () => {
  it('darkens the way the dashboard does', () => {
    // Same arithmetic as `darkenHex` there, on purpose: the gradient a studio
    // approved in the preview has to be the gradient on their site.
    assert.equal(darkenHex('#DEF447'), '#adbe37')
    assert.equal(darkenHex('#ffffff', 0.5), '#808080')
    assert.equal(darkenHex('#000000'), '#000000')
  })

  it('hands back what it cannot read', () => {
    // A colour the studio typed by hand, or an eight-digit hex with alpha:
    // better a flat button than `#NaNNaNNaN`.
    assert.equal(darkenHex('nope'), 'nope')
    assert.equal(darkenHex('#DEF447FF'), '#adbe37')
  })
})
