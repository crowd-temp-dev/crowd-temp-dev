import { computed, defineComponent } from '@vue/composition-api'
import { TestSuiteState } from '~/store/projectSuite'

export default defineComponent({
  name: 'ProjectMixin',
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
        return ($store.state.projectSuite as TestSuiteState).create.section.items[
          stateKey.value
        ]
      },
      set(val) {
        $store.commit('projectSuite/create/section/update', {
          index: stateKey.value,
          data: val,
        })
      },
    })

    return { stateKey, state }
  },
})
