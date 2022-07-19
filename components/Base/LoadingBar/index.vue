<script lang="ts">
import {
  computed,
  defineComponent,
  nextTick,
  onMounted,
  ref,
  watch,
} from '@vue/composition-api'
import { Duration } from '~/types'
import { convertToMilliSecond, debounce, nextFrame, sleep } from '~/utils'
import Countdown from '~/utils/countdown'

export type LoadingBarState = 'start' | 'finish' | 'error'

export default defineComponent({
  name: 'BaseLoadingBar',
  props: {
    duration: {
      type: [Number, String] as unknown as () => number | Duration,
      default: 10000,
    },
    throttle: {
      type: [Number, String] as unknown as () => number | Duration,
      default: 100,
    },
    state: {
      type: String as () => LoadingBarState,
      default: undefined,
    },
  },
  emits: ['on-start', 'on-fail', 'on-finish'],
  setup(_props, { emit }) {
    const show = ref(false)

    const maxProgress = ref(95)

    const completed = ref(false)

    const error = ref(false)

    const percentage = ref(0)

    const extraPercentage = ref(0)

    const countdownDone = ref(false)

    const glow = computed(() => {
      return !!(percentage.value >= 70) && !extraPercentage.value
    })

    const state = computed(() => _props.state)

    const duration = computed(() => {
      return convertToMilliSecond(_props.duration)
    })

    const start = async () => {
      const countdown = new Countdown({
        duration: duration.value,
        onDone: async () => {
          countdownDone.value = true

          await sleep(300)

          if (show.value) {
            percentage.value = maxProgress.value
          }
        },
        onUpdate: (val) => {
          const percentageDone =
            100 -
            Number(
              `${Math.min(
                (val.percentDone === 1 ? -1 : val.percentDone) + 0.1,
                1
              )}`
                .slice(0, 4)
                .replace(/(?:^-)|(?:\.$)/g, '')
            ) *
              100

          const threshold =
            percentage.value < 5
              ? 0
              : percentage.value < 11
              ? 4
              : percentage.value < 21
              ? 8
              : percentage.value < 31
              ? 16
              : percentage.value < 41
              ? 20
              : percentage.value < 51
              ? 16
              : percentage.value < 71
              ? 12
              : percentage.value < 81
              ? 8
              : 4

          if (percentageDone + extraPercentage.value >= percentage.value) {
            debounce(() => {
              if (
                percentage.value < maxProgress.value &&
                !countdownDone.value
              ) {
                percentage.value = percentageDone + extraPercentage.value
              }
            }, threshold * 100)()
          }
        },
      })

      percentage.value = 0

      extraPercentage.value = 0

      countdownDone.value = false

      completed.value = false

      const throttle = convertToMilliSecond(_props.throttle)

      if (throttle) {
        await sleep(throttle)
      }

      show.value = true

      await nextFrame()

      if (!completed.value) {
        emit('on-start')

        const startProgress = () => {
          if (percentage.value <= 2 && show.value) {
            percentage.value += 0.25

            requestAnimationFrame(startProgress)
          } else {
            countdown.start()
          }
        }

        startProgress()
      } else {
        show.value = false

        countdownDone.value = true

        completed.value = true
      }
    }

    const finish = async () => {
      completed.value = true

      countdownDone.value = true

      await sleep(300)

      show.value = false

      emit('on-finish')
    }

    const fail = async () => {
      error.value = true

      emit('on-error')

      await sleep(200)

      finish()
    }

    const increase = (val: number) => {
      extraPercentage.value += val
    }

    const autoProgress = () => {
      nextTick(() => {
        if (state.value === 'start') {
          start()
        } else if (state.value === 'finish') {
          finish()
        } else if (state.value === 'error') {
          fail()
        }
      })
    }

    watch(() => state.value, autoProgress)

    onMounted(autoProgress)

    return {
      show,
      error,
      percentage,
      glow,
      completed,
      start,
      finish,
      fail,
      increase,
    }
  },
})
</script>

<template>
  <div v-if="show" class="LoadingBar">
    <div
      class="rounded-r bg-action-primary-default fill-after transition-transform w-full h-full ease-linear duration-300 relative overflow-hidden after:bg-base-critical after:transition-opacity"
      :class="{
        'after:opacity-0': !error,
        'fill-before glow': glow && !error,
      }"
      :style="{
        transform: `translate3d(-100%,0,0) translate3d(${
          completed ? 100 : percentage
        }%,0,0)`,
      }"
    />
  </div>
</template>

<style scoped lang="postcss">
.LoadingBar {
  @apply fixed top-0 left-0 w-full h-[2.5px] z-[10000] isolate overflow-hidden pointer-events-none;
}

@keyframes glow {
  0% {
    opacity: 0;
    transform: translate3d(-100%, 0, 0);
  }
  20% {
    opacity: 0.75;
  }
  40% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.3;
  }
  60% {
    opacity: 0;
  }
  100% {
    opacity: 0;
    transform: translate3d(100%, 0, 0);
  }
}

.glow::before {
  z-index: 1;
  background-image: linear-gradient(
    to right,
    rgba(255, 255, 255, 0),
    rgba(255, 255, 255)
  );
  transform: translate(-100%, 0);
  opacity: 0;
  animation: glow 3500ms infinite 500ms;
}
</style>
