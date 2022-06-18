import { AppState } from './state'

export default {
  tooltips(state: AppState) {
    return state.dialogs.filter((x) => x.startsWith('tooltip-'))
  },

  nonTooltips(state: AppState) {
    return state.dialogs.filter((x) => !x.startsWith('tooltip-'))
  },
}
