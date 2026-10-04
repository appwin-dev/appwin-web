/**
 * Holds host messages until the panel can hear them.
 *
 * The panel is an iframe that fetches its script and its config before it
 * registers a `message` listener: anything posted earlier, typically the
 * `identify` a host fires right after the snippet loads, is silently lost.
 * Messages queue here until the panel says `ready`, then flow through.
 */
export function createMailbox<T>(deliver: (message: T) => void): {
  post(message: T): void
  open(): void
} {
  const pending: T[] = []
  let opened = false
  return {
    post(message) {
      if (opened) deliver(message)
      else pending.push(message)
    },
    open() {
      if (opened) return
      opened = true
      for (const message of pending.splice(0)) deliver(message)
    },
  }
}
