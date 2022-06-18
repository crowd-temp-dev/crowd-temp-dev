// eslint-disable-next-line import/named
import { MutationTree } from 'vuex'
import { ComponentInstance } from '@vue/composition-api'
import { CreateTestState, TestIndex } from './state'

const mutations:  MutationTree<CreateTestState> = {
  // for progress bar below header
  EDITING(state: CreateTestState, _payload: number) {
    const payload = Math.max(Math.min(_payload, 3), 1)
    // remove from done
    state.progress.done = state.progress.done.filter((_, i) => i !== payload)

    // set current

    state.progress.current = payload
    // @ts-expect-error
    const { router } = this.app as ComponentInstance

    if (router.currentRoute.query.step !== `${payload}`) {
      router.replace({
        query: {
          step: `${payload}`,
        },
      })
    }
  },

  DONE(state: CreateTestState, _payload: number) {
    state.progress.done = [
      ...state.progress.done,
      Math.max(Math.min(_payload, 3), 1),
    ]
  },

  ADD_TEST_INDEX(
    state: CreateTestState,
    _payload: {
      index: number
      value: TestIndex
    }
  ) {
    const { index, value } = _payload

    const { testIndex } = state

    const _value = {
      ...value,
      expanded: true,
    }

    if (typeof index === 'number') {
      const newValue = [
        ...testIndex.slice(0, index),
        _value,
        ...testIndex.slice(index),
      ]

      state.testIndex = newValue
    } else {
      state.testIndex = [...testIndex, _value]
    }
  },

  REMOVE_TEST_INDEX(state: CreateTestState, id: string) {
    state.testIndex = state.testIndex.filter((x) => x.id !== id)
  },

  UPDATE_ALL_TEST_INDEX(state: CreateTestState, _payload: TestIndex[]) {
    state.testIndex = _payload
  },

  UPDATE_TEST_INDEX(
    state: CreateTestState,
    _payload: {
      value: TestIndex
      id: string
    }
  ) {
    const { id, value } = _payload

    console.log(id, value)

    state.testIndex = state.testIndex.map((x) => {
      if (x.id === id) {
        return value
      }

      return x
    })
  },
} 


export default mutations