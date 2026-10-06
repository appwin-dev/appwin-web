import { randomId } from '../../core/device.ts'
import type { CrashContext, CrashFrame, CrashKind, CrashReport } from './types.ts'

/**
 * Well under the contract's 256 KB: a report is sent with `keepalive`, whose
 * 64 KB budget is shared with any analytics batch still in flight.
 */
export const MAX_REPORT_BYTES = 32_000

const MAX_TYPE_LENGTH = 256
const MAX_MESSAGE_LENGTH = 1024
const MAX_VERSION_LENGTH = 64
const MAX_NAME_LENGTH = 128
const MAX_SDK_VERSION_LENGTH = 32

export interface ThrownValue {
  type: string
  message?: string
  stack?: string
}

/**
 * Reads anything that can be thrown. Duck-typed rather than `instanceof Error`:
 * errors from an iframe or a worker come from another realm.
 */
export function describeThrown(value: unknown, fallbackType: string): ThrownValue {
  if (value && typeof value === 'object') {
    const { name, message, stack } = value as { name?: unknown; message?: unknown; stack?: unknown }
    if (typeof message === 'string' || typeof stack === 'string') {
      return {
        type: typeof name === 'string' && name ? name : fallbackType,
        ...(typeof message === 'string' && message ? { message } : {}),
        ...(typeof stack === 'string' ? { stack } : {}),
      }
    }
  }
  const message = stringify(value)
  return { type: fallbackType, ...(message ? { message } : {}) }
}

export function buildReport(
  kind: CrashKind,
  thrown: ThrownValue,
  frames: CrashFrame[],
  context: CrashContext,
  now: number,
): CrashReport {
  const message = thrown.message?.slice(0, MAX_MESSAGE_LENGTH)
  const report: CrashReport = {
    crashId: randomId(),
    kind,
    runtime: 'web',
    occurredAt: new Date(now).toISOString(),
    exception: { type: thrown.type.slice(0, MAX_TYPE_LENGTH), ...(message ? { message } : {}) },
    frames,
    app: { version: context.appVersion.slice(0, MAX_VERSION_LENGTH) },
    device: {
      os: context.os.slice(0, MAX_VERSION_LENGTH),
      model: context.model.slice(0, MAX_NAME_LENGTH),
    },
    sdkVersion: context.sdkVersion.slice(0, MAX_SDK_VERSION_LENGTH),
    ...(context.sessionId ? { sessionId: context.sessionId } : {}),
    ...(context.screen ? { screen: context.screen.slice(0, MAX_NAME_LENGTH) } : {}),
    ...(context.breadcrumbs.length > 0 ? { breadcrumbs: context.breadcrumbs } : {}),
  }
  return fitReport(report, MAX_REPORT_BYTES)
}

/**
 * Drops the outermost frames first, they matter least for grouping, then
 * shortens the message. Breadcrumbs are bounded already (20 short names).
 */
export function fitReport(report: CrashReport, maxBytes: number): CrashReport {
  if (byteLength(report) <= maxBytes) return report
  const fitted: CrashReport = {
    ...report,
    frames: [...report.frames],
    exception: { ...report.exception },
  }
  while (fitted.frames.length > 0 && byteLength(fitted) > maxBytes) {
    const excess = byteLength(fitted) - maxBytes
    // Rough per-frame size, so a 200-frame stack does not reserialize 200 times.
    const average = Math.max(1, JSON.stringify(fitted.frames).length / fitted.frames.length)
    fitted.frames.length = Math.max(0, fitted.frames.length - Math.ceil(excess / average))
  }
  if (byteLength(fitted) > maxBytes && fitted.exception.message) {
    fitted.exception.message = fitted.exception.message.slice(0, 128)
  }
  return fitted
}

export function byteLength(value: unknown): number {
  return new TextEncoder().encode(JSON.stringify(value)).length
}

function stringify(value: unknown): string {
  if (value === undefined) return ''
  if (typeof value === 'string') return value.slice(0, MAX_MESSAGE_LENGTH)
  try {
    return (JSON.stringify(value) ?? String(value)).slice(0, MAX_MESSAGE_LENGTH)
  } catch {
    return String(value).slice(0, MAX_MESSAGE_LENGTH)
  }
}
