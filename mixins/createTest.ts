import { computed, defineComponent } from '@vue/composition-api'

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
    const stateKey = computed(() =>
      Object.keys($store.state['create-test'].form).find(
        (key) => ($store.state['create-test'].form[key] || {}).id === _props.id
      )
    )

    const state = computed({
      get() {
        return $store.state['create-test'].form[stateKey.value || '']
      },
      set(val) {
        $store.dispatch('create-test/updateForm', {
          path: stateKey.value,
          value: val,
        })
      },
    })

    return { stateKey, state }
  },
})
