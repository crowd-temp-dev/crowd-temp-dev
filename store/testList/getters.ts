import { TestListState } from './state'

export default {
  favourite(state: TestListState) {
    return state.items.filter((item) => item.favourite)
  },
}
