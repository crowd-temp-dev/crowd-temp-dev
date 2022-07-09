import { defineComponent, onMounted, computed } from '@vue/composition-api'
import { AppState } from '~/store/app/state'
import { sleep } from '~/utils'

let called = false

export default defineComponent({
  setup(_, { root: { $fullscreenLoading, $store } }) {
    const mounted = computed(() => ($store.state.app as AppState).mounted)

    if (!called) {
      $fullscreenLoading.show({
        message: 'Loading...',
        id: 'app-loading',
      })

      onMounted(() => {
        $store.commit('app/mountApp')

        sleep(200).then(() => {
          $fullscreenLoading.hide({
            id: 'app-loading',
          })
        })
      })

      called = true
    }

    return { mounted }
  },
})
