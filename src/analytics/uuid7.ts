/**
 * UUIDv7 (RFC 9562): 48-bit Unix-ms timestamp, then random bits. Session ids
 * use it so the id carries its start time (ADR-0041).
 */
export function uuid7(nowMs: number = Date.now()): string {
  const bytes = randomBytes(16)
  for (let i = 0; i < 6; i++) {
    bytes[i] = Math.floor(nowMs / 2 ** (8 * (5 - i))) & 0xff
  }
  bytes[6] = 0x70 | (bytes[6]! & 0x0f)
  bytes[8] = 0x80 | (bytes[8]! & 0x3f)

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length)
  try {
    globalThis.crypto.getRandomValues(bytes)
  } catch {
    for (let i = 0; i < length; i++) bytes[i] = Math.floor(Math.random() * 256)
  }
  return bytes
}
