<script lang="ts">
import { defineComponent, onMounted, ref } from '@vue/composition-api'
import { Duration } from '~/types'
import { convertToMilliSecond, sleep } from '~/utils'
// import LoadingBar from '~/components/Base/LoadingBar/index.vue'

export default defineComponent({
  name: 'BaseDelayMount',
  props: {
    delay: {
      type: [String, Number] as unknown as () => Duration,
      default: '200ms',
    },
  },
  setup(_props, { slots }) {
    const isMounted = ref(false)

    onMounted(async () => {
      await sleep(convertToMilliSecond(_props.delay))

      isMounted.value = true
    })

    return () => {
      return isMounted.value ? slots.default() : null
    }
  },
})
</script>
