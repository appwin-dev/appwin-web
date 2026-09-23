/**
 * The handful of pieces every screen repeats: icons, an avatar, a spinner.
 *
 * Icons are inline paths rather than a font or a sprite. The panel must paint
 * on a studio's site with one request for the document and one for the
 * script, and an icon that arrives late is a launcher that jumps.
 */

import { initials } from './format.ts'

interface IconProps {
  /** Square size in pixels; everything here is drawn on a 24 grid. */
  size?: number
}

/** 1.5 is the Solar Linear weight, which is what the icons below are traced from. */
function Svg({ size = 20, children }: IconProps & { children: preact.ComponentChildren }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export const CloseIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Svg>
)

/** Solar `Alt Arrow Left`. */
export const BackIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M15 5L9 12L15 19" />
  </Svg>
)

/** Solar `Alt Arrow Right`. */
export const ChevronIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M9 5L15 12L9 19" />
  </Svg>
)

export const SendIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </Svg>
)

export const AttachIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M21.4 11.1 12.3 20a5.5 5.5 0 0 1-7.8-7.8l9.2-9.1a3.7 3.7 0 0 1 5.2 5.2l-9.2 9.1a1.8 1.8 0 0 1-2.6-2.6l8.5-8.4" />
  </Svg>
)

/*
 * The three below are Solar Linear, traced from the same paths as
 * `SolarIcons.swift` and the dashboard's preview. Hand-drawn lookalikes had
 * the Home screen wearing a different iconography from the two surfaces a
 * studio compares it to.
 */

/** Solar `Plain 2`: the paper plane on "send us a message". */
export const SendToSupportIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M17.4975 18.4851L20.6281 9.09373C21.8764 5.34874 22.5006 3.47624 21.5122 2.48782C20.5237 1.49939 18.6511 2.12356 14.906 3.37189L5.57477 6.48218C3.49295 7.1761 2.45203 7.52305 2.13608 8.28637C2.06182 8.46577 2.01692 8.65596 2.00311 8.84963C1.94433 9.67365 2.72018 10.4495 4.27188 12.0011L4.55451 12.2837C4.80921 12.5384 4.93655 12.6658 5.03282 12.8075C5.22269 13.0871 5.33046 13.4143 5.34393 13.7519C5.35076 13.9232 5.32403 14.1013 5.27057 14.4574C5.07488 15.7612 4.97703 16.4131 5.0923 16.9147C5.32205 17.9146 6.09599 18.6995 7.09257 18.9433C7.59255 19.0656 8.24576 18.977 9.5522 18.7997L9.62363 18.79C9.99191 18.74 10.1761 18.715 10.3529 18.7257C10.6738 18.745 10.9838 18.8496 11.251 19.0285C11.3981 19.1271 11.5295 19.2585 11.7923 19.5213L12.0436 19.7725C13.5539 21.2828 14.309 22.0379 15.1101 21.9985C15.3309 21.9877 15.5479 21.9365 15.7503 21.8474C16.4844 21.5244 16.8221 20.5113 17.4975 18.4851Z" />
    <path d="M6 18L21 3" />
  </Svg>
)

/** Solar `Inbox`: the way to the visitor's own threads. */
export const InboxIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z" />
    <path d="M2 13H5.16026C6.06543 13 6.51802 13 6.91584 13.183C7.31367 13.3659 7.60821 13.7096 8.19729 14.3968L8.80271 15.1032C9.39179 15.7904 9.68633 16.1341 10.0842 16.317C10.482 16.5 10.9346 16.5 11.8397 16.5H12.1603C13.0654 16.5 13.518 16.5 13.9158 16.317C14.3137 16.1341 14.6082 15.7904 15.1973 15.1032L15.8027 14.3968C16.3918 13.7096 16.6863 13.3659 17.0842 13.183C17.482 13 17.9346 13 18.8397 13H22" />
  </Svg>
)

export const MessageIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 21l1.9-5.2A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z" />
  </Svg>
)

export const FileIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M14 3v5h5M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
  </Svg>
)

export function Spinner() {
  return <span class="spinner" role="status" />
}

interface AvatarProps {
  name: string
  url: string | null
  size?: number
}

/**
 * The studio's face.
 *
 * Falls back to initials rather than a generic silhouette: a messenger whose
 * avatar fails to load should still look like it belongs to somebody.
 */
export function Avatar({ name, url, size = 32 }: AvatarProps) {
  const style = { width: `${size}px`, height: `${size}px`, fontSize: `${Math.round(size / 2.6)}px` }
  if (url) {
    return <img class="avatar" style={style} src={url} alt="" loading="lazy" />
  }
  return (
    <span class="avatar avatar-fallback" style={style} aria-hidden="true">
      {initials(name)}
    </span>
  )
}

/** The dot on a thread the studio has replied in. */
export const UnreadDot = () => <span class="unread-dot" />
