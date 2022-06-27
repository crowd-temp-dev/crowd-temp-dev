export interface AppState {
  globalKey: number
  dialogs: string[]
  fullscreenLoadingMessage: null | string
  alertDialog: {
    key: string
    active: boolean
    title: string
    subtitle: string
    actions: {
      label: string
      attrs?: Record<string, any>
      events?: Record<string, any>
    }[]
  }
}

export default function state(): AppState {
  return {
    globalKey: 0,
    dialogs: [],
    fullscreenLoadingMessage: null,
    alertDialog: {
      key: '',
      active: false,
      title: '',
      subtitle: '',
      actions: [],
    },
  }
}
