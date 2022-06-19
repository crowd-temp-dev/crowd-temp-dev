import { TestListItem } from '~/components/App/Home/TestList/type'

export interface TestListState {
  items: TestListItem[]
  showFavourite: boolean
}

export default function state(): TestListState {
  return {
    items: [],

    showFavourite: false,
  }
}
