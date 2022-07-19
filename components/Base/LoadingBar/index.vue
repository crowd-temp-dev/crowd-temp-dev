<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api'
import { debounce, nextFrame, sleep } from '~/utils'
import Countdown from '~/utils/countdown'

export default defineComponent({
  name: 'BaseLoadingBar',
  props: {
    duration: {
      type: Number,
      default: 7000,
    },
    throttle: {
      type: Number,
      default: 100,
    },
  },
  setup(_props) {
    const show = ref(false)

    const completed = ref(false)

    const error = ref(false)

    const percentage = ref(0)

    const extraPercentage = ref(0)

    const countdownDone = ref(false)

    const glow = computed(() => {
      return !!(percentage.value >= 70)
    })

    const start = async () => {
      const countdown = new Countdown({
        duration: _props.duration,
        onDone: () => {
          countdownDone.value = true

          percentage.value = 90
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
            percentage.value < 11
              ? 0
              : percentage.value < 21
              ? 2
              : percentage.value < 31
              ? 4
              : percentage.value < 41
              ? 10
              : percentage.value < 51
              ? 25
              : percentage.value < 61
              ? 35
              : percentage.value < 71
              ? 50
              : percentage.value < 81
              ? 70
              : 90

          debounce(() => {
            if (percentage.value < 90 && !countdownDone.value) {
              percentage.value = percentageDone + extraPercentage.value
            }
          }, threshold * 100)()
        },
      })

      percentage.value = 0

      countdownDone.value = false

      await sleep(_props.throttle)

      show.value = true

      await nextFrame()

      if (!completed.value) {
        countdown.start()
      } else {
        show.value = false

        countdownDone.value = true

        completed.value = false
      }
    }

    const finish = async () => {
      completed.value = true

      countdownDone.value = true

      await sleep(300)

      show.value = false
    }

    const fail = async () => {
      error.value = true

      await sleep(200)

      finish()
    }

    const increase = (val: number) => {
      extraPercentage.value += val
    }

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
  @apply fixed top-0 left-0 w-full h-2 z-[10000] isolate overflow-hidden pointer-events-none;
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
