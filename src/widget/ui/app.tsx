/**
 * The messenger, inside the panel iframe.
 *
 * One screen at a time, and the frame around them: an app bar that goes back
 * or closes, and the body. The layout mirrors the iOS `AppwinRootView` -
 * Home, the thread list, one thread - because a visitor who uses a studio's
 * app and its site must not meet two different products.
 */

import { createContext } from 'preact'
import { useContext, useEffect, useState } from 'preact/hooks'

import type { MessengerConfig } from '../../support/types.ts'
import type { WidgetStrings } from '../strings.ts'
import { Avatar, BackIcon, CloseIcon, Spinner } from './bits.tsx'
import { ConversationsScreen } from './conversations.tsx'
import { FaqScreen } from './faq.tsx'
import { HomeScreen } from './home.tsx'
import { ThreadScreen } from './thread.tsx'
import { agentAvatarUrl, agentLabel } from './theme.ts'
import type { WidgetStore } from './store.ts'

export interface UiContext {
  store: WidgetStore
  strings: WidgetStrings
  /** BCP 47 tag, for `Intl`. Never a hardcoded locale. */
  locale: string
  /** Asks the host page to close the panel, through the bridge. */
  onClose: () => void
}

const Ui = createContext<UiContext | null>(null)

export function useUi(): UiContext {
  const context = useContext(Ui)
  if (!context) throw new Error('[appwin] UI context is missing')
  return context
}

/** Re-renders on every store change. The state is small; diffing is cheaper. */
export function useWidgetState() {
  const { store } = useUi()
  const [state, setState] = useState(store.getState())
  useEffect(() => store.subscribe(() => setState(store.getState())), [store])
  return state
}

export function App(context: UiContext) {
  return (
    <Ui.Provider value={context}>
      <Screen />
    </Ui.Provider>
  )
}

function Screen() {
  const { store, strings } = useUi()
  const state = useWidgetState()

  if (state.status === 'loading') {
    return (
      <div class="centered">
        <Spinner />
      </div>
    )
  }

  if (state.status === 'error' || !state.config) {
    return (
      <div class="centered failure">
        <p class="failure-title">{strings.loadErrorTitle}</p>
        <p class="failure-body">{strings.loadErrorMessage}</p>
        <button type="button" class="button" onClick={() => void store.boot()}>
          {strings.retry}
        </button>
      </div>
    )
  }

  return (
    <>
      <AppBar config={state.config} />
      <main class="body">
        {state.route.name === 'home' && <HomeScreen />}
        {state.route.name === 'conversations' && <ConversationsScreen />}
        {state.route.name === 'faq' && <FaqScreen faqId={state.route.faqId} />}
        {(state.route.name === 'thread' || state.route.name === 'new') && <ThreadScreen />}
      </main>
    </>
  )
}

/**
 * Title bar, painted in the studio's colour.
 *
 * It carries the way back rather than each screen doing it: the back arrow is
 * the only navigation in a panel this small, and it belongs in one place.
 */
function AppBar({ config }: { config: MessengerConfig }) {
  const { store, strings, onClose } = useUi()
  const state = useWidgetState()
  const atHome = state.route.name === 'home'
  const label = agentLabel(config)

  return (
    <header class="appbar">
      {atHome ? (
        <Avatar name={label} url={agentAvatarUrl(config)} size={28} />
      ) : (
        <button
          type="button"
          class="icon-button"
          aria-label={strings.back}
          onClick={() => store.go({ name: 'home' })}
        >
          <BackIcon />
        </button>
      )}
      <h1 class="appbar-title">{atHome ? label : titleFor(state.route.name, strings, label)}</h1>
      <button type="button" class="icon-button" aria-label={strings.close} onClick={onClose}>
        <CloseIcon />
      </button>
    </header>
  )
}

function titleFor(route: string, strings: WidgetStrings, agent: string): string {
  if (route === 'conversations') return strings.conversationsTitle
  if (route === 'faq') return strings.faq
  if (route === 'new') return strings.writeMessage
  // An open thread is a conversation with the studio, so it carries their
  // name rather than a label for the feature.
  return agent
}
