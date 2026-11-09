import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createWidgetController, readLauncherOption, type WidgetView } from './controller.ts'

function recorder(): { view: WidgetView; calls: string[] } {
  const calls: string[] = []
  return {
    calls,
    view: {
      mountPanel: () => calls.push('mount'),
      showPanel: (open) => calls.push(open ? 'show' : 'hide'),
      showLauncher: () => calls.push('launcher'),
    },
  }
}

describe('createWidgetController, launcher shown (the default)', () => {
  it('mounts the panel right away and shows the launcher on ready', () => {
    const { view, calls } = recorder()
    const controller = createWidgetController({ launcher: true }, view)
    assert.deepEqual(calls, ['mount'])
    controller.ready()
    assert.deepEqual(calls, ['mount', 'launcher'])
    controller.toggle()
    assert.equal(controller.isOpen, true)
    controller.toggle()
    assert.deepEqual(calls, ['mount', 'launcher', 'show', 'hide'])
  })
})

describe('createWidgetController, launcher hidden', () => {
  it('mounts nothing until the first open', () => {
    const { view, calls } = recorder()
    const controller = createWidgetController({ launcher: false }, view)
    assert.deepEqual(calls, [])
    assert.equal(controller.isMounted, false)
    controller.close()
    assert.deepEqual(calls, [])
  })

  it('mounts on open() and shows the panel once ready, never the launcher', () => {
    const { view, calls } = recorder()
    const controller = createWidgetController({ launcher: false }, view)
    controller.open()
    assert.deepEqual(calls, ['mount'])
    assert.equal(controller.isOpen, false)
    controller.ready()
    assert.deepEqual(calls, ['mount', 'show'])
    assert.equal(controller.isOpen, true)
  })

  it('closes and reopens without mounting twice', () => {
    const { view, calls } = recorder()
    const controller = createWidgetController({ launcher: false }, view)
    controller.open()
    controller.ready()
    controller.close()
    controller.open()
    assert.deepEqual(calls, ['mount', 'show', 'hide', 'show'])
  })

  it('drops an open that was cancelled before ready', () => {
    const { view, calls } = recorder()
    const controller = createWidgetController({ launcher: false }, view)
    controller.open()
    controller.close()
    controller.ready()
    assert.deepEqual(calls, ['mount'])
    assert.equal(controller.isOpen, false)
  })

  it('toggle() opens from the host button too', () => {
    const { view, calls } = recorder()
    const controller = createWidgetController({ launcher: false }, view)
    controller.toggle()
    controller.ready()
    assert.deepEqual(calls, ['mount', 'show'])
  })
})

describe('readLauncherOption', () => {
  it('keeps the launcher unless told false', () => {
    assert.equal(readLauncherOption(null), true)
    assert.equal(readLauncherOption(''), true)
    assert.equal(readLauncherOption('true'), true)
    assert.equal(readLauncherOption('yes'), true)
    assert.equal(readLauncherOption('false'), false)
    assert.equal(readLauncherOption(' FALSE '), false)
    assert.equal(readLauncherOption('off'), false)
    assert.equal(readLauncherOption('0'), false)
  })
})
