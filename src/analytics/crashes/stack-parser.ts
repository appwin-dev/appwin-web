import type { CrashFrame } from './types.ts'

export const MAX_FRAMES = 200

export interface StackParseOptions {
  /** `location.origin` of the page: frames served from elsewhere are not the studio's code. */
  origin: string | null
}

interface RawFrame {
  fn: string
  url?: string
  line?: number
  col?: number
}

// V8 (Chrome, Edge, Node): `    at fn (url:line:col)`, `    at url:line:col`.
const V8_LINE = /^\s*at\s+(?:async\s+)?(.*)$/
// SpiderMonkey and JavaScriptCore (Firefox, Safari): `fn@url:line:col`.
const GECKO_LINE = /^\s*(.*?)@(.*)$/
const LOCATION = /^(.*?):(\d+)(?::(\d+))?$/

/** Frames of `stack`, innermost first, whatever engine wrote it. Never throws. */
export function parseStack(stack: string | undefined, options: StackParseOptions): CrashFrame[] {
  if (!stack) return []
  const lines = stack.split('\n')
  const v8 = lines.some((line) => V8_LINE.test(line))
  const frames: CrashFrame[] = []
  for (const line of lines) {
    if (frames.length >= MAX_FRAMES) break
    const raw = v8 ? parseV8Line(line) : parseGeckoLine(line)
    if (raw) frames.push(toFrame(raw, options))
  }
  return frames
}

/** A frame from the position an `ErrorEvent` gives when it has no error object (cross-origin scripts). */
export function frameFromLocation(
  url: string | undefined,
  line: number | undefined,
  col: number | undefined,
  options: StackParseOptions,
): CrashFrame[] {
  if (!url) return []
  return [toFrame({ fn: '', url, ...positive('line', line), ...positive('col', col) }, options)]
}

function parseV8Line(line: string): RawFrame | null {
  const match = V8_LINE.exec(line)
  if (!match) return null
  const body = match[1]!.trim()
  const call = /^(.*?) \((.*)\)$/.exec(body)
  let fn = call ? call[1]! : ''
  let location = call ? call[2]! : body
  // `eval at outer (url:1:2), <anonymous>:3:4`: the position inside the eval'd code is last.
  if (location.includes(', ')) location = location.slice(location.lastIndexOf(', ') + 2)
  if (fn.startsWith('async ')) fn = fn.slice(6)
  return { fn, ...splitLocation(location) }
}

function parseGeckoLine(line: string): RawFrame | null {
  const match = GECKO_LINE.exec(line)
  if (!match) return null
  // Firefox prefixes the first frame after an await with `async*`.
  const fn = match[1]!.replace(/^async\*/, '')
  let location = match[2]!
  // Firefox eval frames: `fn@url line 2 > eval:1:5`.
  if (location.includes(' > ')) location = location.slice(0, location.indexOf(' line '))
  return { fn, ...splitLocation(location) }
}

function splitLocation(location: string): Omit<RawFrame, 'fn'> {
  const match = LOCATION.exec(location)
  if (!match) return location ? { url: location } : {}
  return {
    url: match[1]!,
    ...positive('line', Number(match[2])),
    ...positive('col', match[3] === undefined ? undefined : Number(match[3])),
  }
}

function positive<K extends 'line' | 'col'>(
  key: K,
  value: number | undefined,
): Partial<Record<K, number>> {
  return value !== undefined && Number.isInteger(value) && value >= 0
    ? ({ [key]: value } as Partial<Record<K, number>>)
    : {}
}

function toFrame(raw: RawFrame, options: StackParseOptions): CrashFrame {
  const frame: CrashFrame = { fn: raw.fn.slice(0, 512), inApp: false }
  const url = parseUrl(raw.url)
  if (url) {
    // Path only: query strings and fragments can carry tokens or emails.
    frame.file = url.pathname.slice(0, 512)
    frame.module = url.origin.slice(0, 256)
    frame.inApp = url.origin === options.origin && !url.pathname.includes('/node_modules/')
  } else if (raw.url) {
    frame.file = raw.url.slice(0, 512)
  }
  if (raw.line !== undefined) frame.line = raw.line
  if (raw.col !== undefined) frame.col = raw.col
  return frame
}

function parseUrl(raw: string | undefined): { origin: string; pathname: string } | null {
  if (!raw || !/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) return null
  try {
    const url = new URL(raw)
    // `chrome-extension://id` has an opaque "null" origin.
    const origin = url.origin === 'null' ? `${url.protocol}//${url.host}` : url.origin
    return { origin, pathname: url.pathname }
  } catch {
    return null
  }
}
