import { computed, defineComponent } from '@vue/composition-api'
import { TestSuiteState } from '~/store/testSuite'

export default defineComponent({
  name: 'CreateTestMixin',
  props: {
    rootNumber: {
      type: Number,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
  },
  setup(_props, { root: { $store } }) {
    const stateKey = computed(() => _props.rootNumber - 1)

    const state = computed({
      get() {
        return ($store.state.testSuite as TestSuiteState).create.section.items[
          stateKey.value
        ]
      },
      set(val) {
        $store.commit('testSuite/create/section/update', {
          index: stateKey.value,
          data: val,
        })
      },
    })

    return { stateKey, state }
  },
})
