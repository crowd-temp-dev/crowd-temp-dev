import { TestListState } from './state'

export default {
  UPDATE_ITEM(
    state: TestListState,
    payload: {
      id: string
      value: Record<string, any>
    }
  ) {
    const { id, value } = payload

    const newValues = state.items.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          ...value,
        }
      }

      return item
    })

    state.items = newValues
  },

  SHOW_FAVOURITE(state: TestListState, payload: boolean) {
    state.showFavourite = payload
  },
}
