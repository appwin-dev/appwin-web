/**
 * The banner above the greeting on Home.
 *
 * A port of `messenger-banner.tsx` in the dashboard (Figma BannerForSupport
 * 441:6615), which is also what `MessengerBannerView.swift` ports on iOS. The
 * three must agree: a studio picks a preset in the dashboard's preview and
 * expects the same picture on their site.
 *
 * The insets and percentages below come from Figma and mean nothing on their
 * own - they are a transcription, not a design. Touching one of them without
 * the frame in front of you is how the three surfaces start to drift.
 *
 * Assets are fetched from `context.assetsBaseUrl`, which the server fills with
 * the dashboard's origin. The native SDKs bundle them instead; a browser
 * should not carry a quarter of a megabyte of PNG for a picture most visitors
 * will never scroll past.
 */

import type { MessengerConfig, MessengerDesign } from '../../support/types.ts'
import { darkenHex } from './theme.ts'

/** Slate 200, the neutral the two sober presets are built on. */
const SLATE_200 = '#e2e8f0'

function assets(baseUrl: string) {
  const at = (name: string): string => `${baseUrl}/support/banners/${name}`
  return {
    tileA: at('tile-a.svg'),
    tileB: at('tile-b.svg'),
    emojiWave: at('emoji-wave.png'),
    emojiLaptop: at('emoji-laptop.png'),
    emojiLifebuoy: at('emoji-lifebuoy.png'),
    amicale: at('amicale.svg'),
    discret: at('discret.svg'),
    photo: at('photo.png'),
    iconRingOuter: at('icon-ring-outer.svg'),
    iconRingMid: at('icon-ring-mid.svg'),
    iconRingInner: at('icon-ring-inner.svg'),
    iconHeadset: at('icon-headset.svg'),
    iconMic: at('icon-mic.svg'),
    serious: at('serious.svg'),
  }
}

type Assets = ReturnType<typeof assets>
type TileKind = 'a' | 'b' | 'wave' | 'laptop' | 'lifebuoy' | 'empty'

/** `[top, right, bottom, left]`, in percent of the banner, straight from Figma. */
type TileInset = [number, number, number, number]

const EMOJI_TILES: { inset: TileInset; kind: TileKind }[] = [
  { inset: [1.24, 88.08, 52.42, -3.14], kind: 'a' },
  { inset: [-5.04, 73.56, 58.7, 11.38], kind: 'b' },
  { inset: [-11.32, 59.04, 64.98, 25.91], kind: 'a' },
  { inset: [-17.6, 44.51, 71.26, 40.43], kind: 'a' },
  { inset: [-23.88, 29.99, 77.55, 54.95], kind: 'a' },
  { inset: [-30.16, 15.46, 83.83, 69.48], kind: 'b' },
  { inset: [-36.44, 0.94, 90.11, 84], kind: 'a' },
  { inset: [45.93, 86.04, 7.73, -1.1], kind: 'a' },
  { inset: [39.65, 71.52, 14.01, 13.42], kind: 'b' },
  { inset: [33.37, 56.99, 20.29, 27.95], kind: 'wave' },
  { inset: [27.09, 42.47, 26.58, 42.47], kind: 'laptop' },
  { inset: [20.81, 27.95, 32.86, 56.99], kind: 'lifebuoy' },
  { inset: [14.53, 13.42, 39.14, 71.52], kind: 'b' },
  { inset: [8.25, -1.1, 45.42, 86.04], kind: 'a' },
  { inset: [90.62, 84, -36.96, 0.94], kind: 'a' },
  { inset: [84.34, 69.48, -30.67, 15.46], kind: 'b' },
  { inset: [78.06, 54.95, -24.39, 29.99], kind: 'a' },
  { inset: [71.78, 40.43, -18.11, 44.51], kind: 'a' },
  { inset: [65.5, 25.91, -11.83, 59.04], kind: 'empty' },
  { inset: [59.22, 11.38, -5.55, 73.56], kind: 'b' },
  { inset: [52.94, -3.14, 0.73, 88.08], kind: 'a' },
]

function tileSrc(kind: TileKind, asset: Assets): string | null {
  switch (kind) {
    case 'a':
      return asset.tileA
    case 'b':
      return asset.tileB
    case 'wave':
      return asset.emojiWave
    case 'laptop':
      return asset.emojiLaptop
    case 'lifebuoy':
      return asset.emojiLifebuoy
    case 'empty':
      return null
  }
}

/** `inset: a b c d` as Figma writes it, in percent. */
function inset(top: number, right: number, bottom: number, left: number) {
  return { top: `${top}%`, right: `${right}%`, bottom: `${bottom}%`, left: `${left}%` }
}

export function Banner({ config }: { config: MessengerConfig }) {
  const { design } = config
  if (design.bannerSource === 'none') return null

  if (design.bannerSource === 'custom') {
    if (!design.bannerUrl) return null
    return (
      <div class="banner">
        <img
          class="banner-fill"
          src={design.bannerUrl}
          alt=""
          style={{ objectFit: 'cover', objectPosition: `center ${design.bannerFocusY}%` }}
        />
      </div>
    )
  }

  return (
    <div class="banner">
      <Preset design={design} brand={config.colors.primary} asset={assets(config.context.assetsBaseUrl)} />
    </div>
  )
}

function Preset({
  design,
  brand,
  asset,
}: {
  design: MessengerDesign
  brand: string
  asset: Assets
}) {
  switch (design.presetBannerId) {
    case 'amicale':
      return <Amicale brand={brand} asset={asset} />
    case 'discret':
      return <Discret asset={asset} />
    case 'photo':
      return <Photo brand={brand} asset={asset} />
    case 'icon':
      return <IconArt brand={brand} asset={asset} />
    case 'serious':
      return <Serious asset={asset} />
    case 'emojis':
    default:
      return <Emojis brand={brand} asset={asset} />
  }
}

/** Figma style=emojie (441:7565). */
function Emojis({ brand, asset }: { brand: string; asset: Assets }) {
  return (
    <div class="banner-fill" style={{ backgroundColor: brand }}>
      {EMOJI_TILES.map((tile, index) => {
        const [top, right, bottom, left] = tile.inset
        const src = tileSrc(tile.kind, asset)
        return (
          <div key={index} class="tile-slot" style={inset(top, right, bottom, left)}>
            <div class="tile">
              {src ? (
                <img class="banner-fill" src={src} alt="" />
              ) : (
                <div class="tile-empty" />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** Figma style=flat / Amicale (441:6614). */
function Amicale({ brand, asset }: { brand: string; asset: Assets }) {
  return (
    <div
      class="banner-fill"
      style={{
        backgroundImage:
          `linear-gradient(90deg, rgba(255,255,255,0.2), rgba(255,255,255,0.2)),` +
          ` linear-gradient(90deg, ${brand}, ${brand})`,
      }}
    >
      <div class="banner-layer" style={inset(-14.87, 22.83, -15.38, 22.83)}>
        <img class="banner-fill" src={asset.amicale} alt="" />
      </div>
    </div>
  )
}

/** Figma style=discret (441:7515). */
function Discret({ asset }: { asset: Assets }) {
  return (
    <div class="banner-fill" style={{ backgroundColor: SLATE_200 }}>
      <div class="banner-layer" style={inset(-15.9, 16.67, -89.23, 16.67)}>
        <img class="banner-fill" src={asset.discret} alt="" />
      </div>
    </div>
  )
}

/** Figma style=photo (441:6616). */
function Photo({ brand, asset }: { brand: string; asset: Assets }) {
  return (
    <div class="banner-fill" style={{ backgroundColor: darkenHex(brand, 0.45) }}>
      <div class="banner-photo">
        <img class="banner-fill" style={{ objectFit: 'cover' }} src={asset.photo} alt="" />
      </div>
      <div class="banner-fill" style={{ backgroundColor: brand, opacity: 0.8 }} />
    </div>
  )
}

/** Figma style=icon (441:7957). */
function IconArt({ brand, asset }: { brand: string; asset: Assets }) {
  return (
    <div class="banner-fill" style={{ backgroundColor: brand }}>
      <div class="banner-layer" style={inset(-71.28, 10, -74.87, 10)}>
        <img class="banner-fill" src={asset.iconRingOuter} alt="" />
      </div>
      <div class="banner-layer" style={inset(-40.51, 20, -44.1, 20)}>
        <img class="banner-fill" src={asset.iconRingMid} alt="" />
      </div>
      <div class="banner-layer" style={inset(-9.74, 30, -13.33, 30)}>
        <img class="banner-fill" src={asset.iconRingInner} alt="" />
      </div>
      <div class="banner-badge">
        <div class="banner-layer" style={inset(12.5, 12.5, 12.5, 12.5)}>
          <img class="banner-fill" src={asset.iconHeadset} alt="" />
        </div>
        <div class="banner-layer" style={inset(64.64, 39.64, 27.08, 39.64)}>
          <img class="banner-fill" src={asset.iconMic} alt="" />
        </div>
      </div>
    </div>
  )
}

/** Figma style=serieux (441:7404). */
function Serious({ asset }: { asset: Assets }) {
  return (
    <div class="banner-fill" style={{ backgroundColor: SLATE_200 }}>
      <div class="banner-layer" style={inset(-21.54, 19.67, -65.13, 19.67)}>
        <img class="banner-fill" src={asset.serious} alt="" />
      </div>
    </div>
  )
}
