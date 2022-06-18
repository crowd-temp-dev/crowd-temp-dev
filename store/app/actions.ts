import UiTrapFocus from 'ui-trap-focus'
import { AppState } from './state'
import { oneFrame, sleep } from '~/utils'

const fullscreenWrapperId = 'fullscreen-loading'

let pageLoadingCalled = 0

const customIdAppend = '-fullscreen-loading'

const toggleHTMLOverflow = (state: AppState, lock?: boolean) => {
  //   dont remove fullscreen-loading class if there's an active fullscreen-loading
  if (!lock && state.fullscreenLoadingMessage) {
    return
  }

  const html = document.documentElement || document.querySelector('html')

  if (html) {
    html.classList[lock ? 'add' : 'remove']('fullscreen-loading')
  }
}

export default {
  hideFullscreenLoading(
    {
      commit,
      state,
    }: {
      commit: (name: string, payload: any) => void
      state: AppState
    },
    payload?: { id?: string }
  ) {
    sleep(oneFrame).then(() => {
      const payloadId = payload?.id

      // find fullscreen loading el
      const wrapper = document.getElementById(
        payloadId ? `${payloadId}${customIdAppend}` : fullscreenWrapperId
      )

      if (wrapper) {
        const removeWrapper = () => {
          wrapper.remove()

          commit('fullscreenLoadingMessage', null)

          // release html scroll
          toggleHTMLOverflow(state)
        }

        // add transitionend event and remove el
        wrapper.addEventListener(
          'transitionend',
          (evt) => {
            if (evt.target === evt.currentTarget) {
              removeWrapper()
            }
          },
          { once: true }
        )

        wrapper.classList.add('opacity-0')

        // use sleep anyway to remove as well
        sleep(150).then(removeWrapper)
      } else {
        // release html scroll
        toggleHTMLOverflow(state)
      }
    })
  },

  async showFullscreenLoading(
    {
      commit,
      dispatch,
      state,
    }: {
      commit: (name: string, payload: any) => void
      dispatch: (name: string) => Promise<void>
      state: AppState
    },
    payload: {
      message: string | null
      delay?: number
      duration?: number
      id?: string
      fadeAppear?: boolean
    }
  ) {
    if (process.client) {
      const { message = '', delay, duration, id, fadeAppear = true } = payload

      if (!message) return

      commit('fullscreenLoadingMessage', message)

      pageLoadingCalled += 1

      const wrapperId = id ? `${id}${customIdAppend}` : fullscreenWrapperId

      const wrapper = document.createElement('div')

      wrapper.id = wrapperId

      const describeId = `describe-${wrapperId}`

      wrapper.style.zIndex = `${1000 + pageLoadingCalled}`

      wrapper.classList.add(
        'flex-centered',
        'p-16',
        'md:p-20',
        'bg-surface-default',
        'fixed',
        'w-full',
        'h-full',
        'inset-0',
        'outline-none',
        'fade-appear',
        'transition-opacity'
      )

      wrapper.setAttribute('role', 'dialog')

      wrapper.setAttribute('aria-modal', 'true')

      wrapper.setAttribute('aria-describedby', describeId)

      wrapper.setAttribute('tabindex', '0')

      wrapper.dataset.uid = `${pageLoadingCalled}`

      // trap focus
      wrapper.addEventListener('keydown', (evt) => {
        new UiTrapFocus().init(evt)
      })

      wrapper.innerHTML = `<div data-message='${message}' class='${
        fadeAppear ? 'fade-appear ' : ''
      }text-display-large-sm md:text-display-large font-sf-pro-display text-text-highlight before:content-[attr(data-message)] before:animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite]' style='animation-duration:1.25s;'><p id='${describeId}' class='sr-only' tabindex='0'>${message}</p></div>`

      const body = document.body || document.querySelector('body')

      if (body) {
        const existingWrapper = document.getElementById(wrapperId)

        if (existingWrapper) {
          existingWrapper.remove()
        }

        await sleep(delay)

        body.append(wrapper)

        wrapper.focus()

        // lock html scroll
        toggleHTMLOverflow(state, true)

        if (duration) {
          await sleep(duration)

          if (wrapper.dataset.uid === `${pageLoadingCalled}`) {
            dispatch('hideFullscreenLoading')
          }
        }
      }
    }
  },
}
