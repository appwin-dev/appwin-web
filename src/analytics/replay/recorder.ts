import { record } from '@rrweb/record'

import type { Session } from '../../core/session.ts'
import type { AppwinStorage } from '../../core/storage.ts'
import { REPLAY_LIMITS, type ReplaySettings } from './config.ts'
import { blockSelector, maskText, maskTextSelector } from './masking.ts'
import { RecordingState } from './recording-state.ts'
import { compressEvents, Segment, type RecordedEvent, type Viewport } from './segment.ts'
import { SegmentShipper } from './shipper.ts'
import { createReplaySender, ReplayUploader } from './uploader.ts'

/**
 * The part of session replay that pulls rrweb in. It is only reached through
 * the dynamic `import()` of `index.ts`, so a site where replay is off, or a
 * visitor who was not sampled, never downloads it.
 */
export interface Recorder {
  /** The session to record, or `null` to stop after sending what was recorded. */
  sync(sessionId: string | null): void
  screen(name: string): void
  /** Drops the segment in progress and the upload queue, as after a consent withdrawal. */
  discard(): void
  stop(): void
}

export interface RecorderDeps {
  session: Session
  storage: AppwinStorage
  settings: ReplaySettings
  currentScreen: () => string | null
  /** The server answered 403: replay was switched off since this page loaded. */
  onDisabled: () => void
}

interface Recording {
  sessionId: string
  segment: Segment
  stopRrweb: () => void
  timer: ReturnType<typeof setInterval> | undefined
}

export function createRecorder(deps: RecorderDeps): Recorder {
  const state = new RecordingState(deps.storage)
  const uploader = new ReplayUploader({
    send: createReplaySender(deps.session),
    onDisabled: () => {
      stop()
      deps.onDisabled()
    },
  })
  const shipper = new SegmentShipper({
    state,
    compress: compressEvents,
    push: (segment) => uploader.push(segment),
    onOversized: (sessionId) => {
      // Later segments only hold changes to what this one described: start
      // over from a full picture of the page, or the rest would not replay.
      if (recording?.sessionId === sessionId) record.takeFullSnapshot(true)
    },
    onBudgetSpent: (sessionId) => {
      if (recording?.sessionId === sessionId) drop()
    },
  })
  let target: string | null = null
  let recording: Recording | null = null
  let stopped = false

  const viewport = (): Viewport => ({ width: innerWidth, height: innerHeight })

  function begin(sessionId: string): void {
    if (!state.hasBudget(sessionId)) return
    const segment = new Segment(Date.now())
    // Set before `record()`: rrweb emits the full snapshot synchronously, from inside the call.
    const current: Recording = { sessionId, segment, stopRrweb: () => {}, timer: undefined }
    recording = current
    const screen = deps.currentScreen()
    if (screen) segment.addScreen(screen, segment.startedAt)

    const stopRrweb = record<RecordedEvent>({
      emit: (event) => {
        if (recording === current) current.segment.add(event, viewport())
      },
      maskAllInputs: true,
      maskTextSelector: maskTextSelector(deps.settings),
      maskTextFn: maskText,
      blockSelector: blockSelector(deps.settings),
      recordCanvas: false,
      collectFonts: false,
      inlineImages: false,
      slimDOMOptions: 'all',
      sampling: { mousemove: 50, scroll: 150, media: 800, input: 'last' },
    })
    if (!stopRrweb) {
      recording = null
      return
    }
    current.stopRrweb = stopRrweb
    current.timer = setInterval(cut, REPLAY_LIMITS.segmentMs)
  }

  function cut(): void {
    const current = recording
    if (!current || current.segment.isEmpty) return
    const done = current.segment
    const endedAt = Date.now()
    current.segment = new Segment(endedAt)
    void shipper.ship(done, current.sessionId, endedAt)
  }

  function end(): void {
    const current = recording
    if (!current) return
    cut()
    clearInterval(current.timer)
    current.stopRrweb()
    if (recording === current) recording = null
  }

  function drop(): void {
    const current = recording
    if (!current) return
    clearInterval(current.timer)
    current.stopRrweb()
    recording = null
  }

  // Hidden tabs do not record: each visible tab in turn continues the same
  // session, so its segments follow each other instead of interleaving.
  const onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      uploader.leaving = true
      end()
      void uploader.flush()
    } else {
      uploader.leaving = false
      if (target && !recording) begin(target)
    }
  }
  document.addEventListener('visibilitychange', onVisibilityChange)

  function stop(): void {
    if (stopped) return
    stopped = true
    target = null
    drop()
    shipper.discard()
    uploader.clear()
    document.removeEventListener('visibilitychange', onVisibilityChange)
  }

  return {
    sync(sessionId) {
      if (stopped) return
      target = sessionId
      if (recording && recording.sessionId !== sessionId) end()
      if (!recording && sessionId && document.visibilityState !== 'hidden') begin(sessionId)
    },
    screen(name) {
      recording?.segment.addScreen(name, Date.now())
    },
    discard() {
      target = null
      drop()
      shipper.discard()
      uploader.clear()
    },
    stop,
  }
}
