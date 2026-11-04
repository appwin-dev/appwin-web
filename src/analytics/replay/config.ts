/** Mirrors `REPLAY_LIMITS` in the contracts, so every SDK records within the same bounds (ADR-0057). */
export const REPLAY_LIMITS = {
  segmentMs: 10_000,
  maxSessionMs: 3_600_000,
  segmentMaxBytes: 2 * 1024 * 1024,
  /** Browsers refuse a `keepalive` body past 64 KB, multipart overhead included. */
  keepaliveMaxBytes: 60_000,
  maxScreens: 100,
  maxTouches: 1_000,
  /** Segments waiting for the network; past it the oldest go, the newest are what a crash needs. */
  maxQueuedSegments: 30,
}

export interface ReplaySettings {
  sampleRate: number
  maskAllText: boolean
  maskAllImages: boolean
}

/**
 * `products.replay.config` of the availability answer. Anything missing or
 * malformed falls back to the strictest reading: everything masked.
 */
export function parseReplaySettings(raw: Record<string, unknown> | undefined): ReplaySettings {
  const rate = raw?.sampleRate
  return {
    sampleRate: typeof rate === 'number' && rate >= 0 && rate <= 1 ? rate : 1,
    maskAllText: raw?.maskAllText !== false,
    maskAllImages: raw?.maskAllImages !== false,
  }
}

/**
 * Decided from the session id alone, so every tab, and every SDK, agrees on a
 * session without talking: the last 32 bits of the UUID as a fraction of 2^32.
 * The last ones, not the first: a UUIDv7 starts with its timestamp, whose top
 * bits are the same for every session of the week.
 */
export function isSampled(sessionId: string, sampleRate: number): boolean {
  if (sampleRate >= 1) return true
  if (sampleRate <= 0) return false
  const tail = Number.parseInt(sessionId.replace(/-/g, '').slice(-8), 16)
  if (!Number.isFinite(tail)) return false
  return tail / 2 ** 32 < sampleRate
}
