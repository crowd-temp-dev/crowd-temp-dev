import { MutationTree } from 'vuex'
import { AppState } from './state'
import { oneFrame, setClientOs, sleep } from '~/utils'

const mutation: MutationTree<AppState> = {
  mountApp(state) {
    state.mounted = true

    document.dispatchEvent(
      new Event('app-mounted', {
        cancelable: false,
      })
    )
  },

  addToDialogs(state, id: string) {
    state.dialogs = Array.from(new Set([...state.dialogs, id]))
  },

  removeFromDialogs(state, id: string) {
    state.dialogs = state.dialogs.filter((x) => x !== id)
  },

  fullscreenLoadingMessage(state, message: string) {
    state.fullscreenLoadingMessage = message
  },

  updateAlertDialog(state, payload: AppState['alertDialog']) {
    state.alertDialog = {
      ...state.alertDialog,
      ...payload,
    }
  },

  updateGlobalKey(state) {
    state.globalKey += 1

    sleep(oneFrame).then(setClientOs)
  },
}

export default mutation
