import { MutationTree } from 'vuex'
import { AppState } from './state'

const mutation: MutationTree<AppState> = {
  addToDialogs(state, id: string) {
    state.dialogs = [...state.dialogs, id]
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
  }
}

export default mutation
