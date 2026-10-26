import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createMailbox } from './mailbox.ts'

describe('createMailbox', () => {
  it('holds messages posted before the panel is ready, in order', () => {
    const delivered: string[] = []
    const mailbox = createMailbox<string>((message) => delivered.push(message))
    mailbox.post('identify')
    mailbox.post('open')
    assert.deepEqual(delivered, [])
    mailbox.open()
    assert.deepEqual(delivered, ['identify', 'open'])
  })

  it('delivers straight away once opened', () => {
    const delivered: string[] = []
    const mailbox = createMailbox<string>((message) => delivered.push(message))
    mailbox.open()
    mailbox.post('logout')
    assert.deepEqual(delivered, ['logout'])
  })

  it('ignores a second ready', () => {
    const delivered: string[] = []
    const mailbox = createMailbox<string>((message) => delivered.push(message))
    mailbox.post('identify')
    mailbox.open()
    mailbox.open()
    assert.deepEqual(delivered, ['identify'])
  })
})
