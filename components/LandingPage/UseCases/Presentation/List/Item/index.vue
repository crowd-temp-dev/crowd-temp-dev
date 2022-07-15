<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import { nextFrame } from '~/utils'
import Intersection from '~/components/Base/Intersection/index.vue'

export default defineComponent({
  name: 'LandinPageUseCasesListItem',
  components: { Intersection },

  props: {
    active: Boolean,
    paused: Boolean,
    startAnimation: {
      type: Boolean,
      default: true,
    },
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      required: true,
    },
  },
  emits: ['progress-done'],
  setup(_props, { emit }) {
    const showProgress = ref(_props.startAnimation)
    const onClick = async (evt: PointerEvent) => {
      showProgress.value = false
      const viewBox = document.getElementById('presentation-view-box')

      if (viewBox) {
        const header = document.getElementById('landing-page-header')

        const headerHeight = header ? header.clientHeight : 58

        window.scrollTo({
          top:
            viewBox.offsetTop -
            headerHeight -
            48 /** 48 = backdrop is 16, margin is 32 **/,
          behavior: 'smooth',
        })
      }
      emit('click', evt)
      await nextFrame()
      showProgress.value = _props.startAnimation
    }
    const onAnimationend = async (evt: AnimationEvent) => {
      if (
        evt.pseudoElement === '::after' &&
        evt.animationName.startsWith('progress-anim')
      ) {
        await nextFrame()
        emit('progress-done')
      }
    }
    return { showProgress, onClick, onAnimationend }
  },
})
</script>

<template>
  <Intersection v-slot="{ isIntersecting }" :config="{ rootMargin: '-32px' }">
    <li
      class="lg:w-350 w-full h-114 rounded-lg p-20 grid gap-y-10 transition-all relative isolate overflow-hidden active:opacity-80 transform-gpu active:scale-[0.995]"
      :class="{
        'bg-surface-selected-default': active,
        'progress-anim fill-after after:z-1 after:!h-4 after:!top-auto after:bottom-0 after:bg-action-primary-default after:!rounded-l-none after:translate-x-[-100%]':
          showProgress && active,
        paused: paused || !isIntersecting,
      }"
      @click="onClick"
      @animationend="onAnimationend"
    >
      <h3 class="text-heading font-semibold cursor-default">
        {{ title }}
      </h3>

      <p class="cursor-default">
        {{ subtitle }}
      </p>
    </li>
  </Intersection>
</template>

<style scoped>
@keyframes progress-anim {
  from {
    transform: translate3d(-100%, 0, 0);
  }
  to {
    transform: translate3d(0, 0, 0);
  }
}

.progress-anim::after {
  animation: progress-anim 7.5s cubic-bezier(0.645, 0.045, 0.355, 1);
}

@media (hover: hover) {
  .progress-anim:hover::after {
    animation-play-state: paused;
  }
}

.progress-anim.paused::after {
  animation-play-state: paused;
}
</style>
