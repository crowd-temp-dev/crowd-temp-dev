import { defineComponent, onMounted, computed } from '@vue/composition-api'
import { AppState } from '~/store/app/state'
import { nextFrame, sleep } from '~/utils'

let called = false

export default defineComponent({
  setup(_, { root: { $fullscreenLoading, $store } }) {
    const mounted = computed(() => ($store.state.app as AppState).mounted)

    if (!called) {
      $fullscreenLoading.show({
        message: 'Loading...',
        id: 'app-loading',
      })

      onMounted(async () => {
        await sleep(200)

        $store.commit('app/mountApp')

        await nextFrame()

        $fullscreenLoading.hide({
          id: 'app-loading',
        })
      })

      called = true
    }

    return { mounted }
  },
})
