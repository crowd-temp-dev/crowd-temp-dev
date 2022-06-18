import { defineComponent, onMounted, ref } from '@vue/composition-api'
import { sleep } from '~/utils'

let _mounted = false

let called = false

export default defineComponent({
  setup(
    _,
    { root: { $fullscreenLoading } }
  ) {
    const mounted = ref(_mounted)

    if (!called) {
      $fullscreenLoading.show({
        message: 'Loading...',
        id: 'app-loading',
      })

      onMounted(() => {
        _mounted = true

        sleep(200).then(() => {
          mounted.value = true

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
