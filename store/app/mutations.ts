import { AppState } from './state'

export default {
  addToDialogs(state: AppState, id: string) {
    state.dialogs = [...state.dialogs, id]
  },

  removeFromDialogs(state: AppState, id: string) {
    state.dialogs = state.dialogs.filter((x) => x !== id)
  },

  fullscreenLoadingMessage(state: AppState, message: string) {
    state.fullscreenLoadingMessage = message
  },

  updateAlertDialog(state: AppState, payload: AppState['alertDialog']) {
    state.alertDialog = {
      ...state.alertDialog,
      ...payload
    }
  }
}
