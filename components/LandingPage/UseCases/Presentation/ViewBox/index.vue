<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'
import { stepper } from '~/utils'
import Intersection from '~/components/Base/Intersection/index.vue'

export default defineComponent({
  name: 'LandinPageUseCasesPresentationView',
  components: { FadeTransition, Intersection },
  props: {
    currentItem: {
      type: Number,
      required: true,
    },
  },
  emits: ['image-hovered', 'image-loaded'],
  setup() {
    return { stepper }
  },
})
</script>

<template>
  <Intersection
    v-slot="{ intersectionRatio, boundingClientRect, isIntersecting }"
    thresholds="100"
    :config="{ rootMargin: '-58px 0px 0px 0px' }"
  >
    <div
      id="presentation-view-box"
      class="h-[584px] w-full max-w-[715px] rounded-[22px] relative isolate"
    >
      <div
        class="pseudo bg-surface-selected-pressed -z-1 rounded-[inherit] h-[inherit] w-[inherit]"
        :style="{
          transform:
            (boundingClientRect || {}).top < 58
              ? 'translate3d(-16px,-16px,0)'
              : `translate3d(${stepper(-16, 0, intersectionRatio)}px,${stepper(
                  -16,
                  0,
                  intersectionRatio
                )}px,0)`,
          willChange:
            isIntersecting &&
            intersectionRatio < 1 &&
            (boundingClientRect || {}).top > 58
              ? 'transform'
              : undefined,
        }"
      />

      <div
        class="rounded-[inherit] h-[inherit] w-[inherit] pl-49 pt-66"
        :style="{
          'background-image':
            'linear-gradient(122.49deg, #FBFFFF 1.03%, #FAFBFB 99.27%)',
          filter: `drop-shadow(0.5px 1px 1px rgb(0, 0, 0, 0.035)) drop-shadow(-3px -1px 3px hsl(215, 26%, 60%, ${stepper(
            0.075,
            0,
            (boundingClientRect || {}).top < 58 ? 1 : intersectionRatio
          )})) drop-shadow(-4px -3px 4px hsl(215, 46%, 75%, ${stepper(
            0.025,
            0,
            (boundingClientRect || {}).top < 58 ? 1 : intersectionRatio
          )}))`,
        }"
      >
        <div
          class="h-360 w-[505px] rounded-[18px] bg-surface-default z-1 relative"
        >
          <FadeTransition>
            <div
              :key="currentItem"
              class="w-full h-full"
              @mouseenter="$emit('image-hovered', true)"
              @mouseout="$emit('image-hovered', false)"
            >
              <Img
                :src="`static/png/landing-page/use-cases/presentation/view/home`"
                :alt="`Home view`"
                @load:success="$emit('image-loaded')"
              />
            </div>
          </FadeTransition>
        </div>
      </div>
    </div>
  </Intersection>
</template>
