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
    :disabled="!$breakpoint.isLaptop"
  >
    <div
      id="presentation-view-box"
      class="h-[584px] w-full max-w-[715px] rounded-[9.05px] lg:rounded-[22px] relative isolate"
      :style="
        !$breakpoint.isLaptop
          ? {
              width: 'calc(100% - 5.76px)',
              height: '240px',
              minHeight: '240px',
            }
          : {}
      "
    >
      <div
        class="pseudo bg-surface-selected-pressed -z-1 rounded-[inherit] h-[inherit] w-[inherit]"
        :style="{
          transform:
            (boundingClientRect || {}).top < 58 || !$breakpoint.isLaptop
              ? `${!$breakpoint.isLaptop ? '' : 'translate3d(-16px,-16px,0)'}`
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
          width: !$breakpoint.isLaptop ? 'calc(100% - 5.76px)' : undefined,
        }"
      />

      <div
        class="rounded-[inherit] h-[inherit] w-[inherit] pl-20 lg:pl-49 pt-27 lg:pt-66"
        :style="{
          'background-image':
            'linear-gradient(122.49deg, #FBFFFF 1.03%, #FAFBFB 99.27%)',
          filter: `drop-shadow(0.5px 1px 1px rgb(0, 0, 0, 0.035)) drop-shadow(-3px -1px 3px hsl(215, 26%, 60%, ${stepper(
            0.075,
            0,
            (boundingClientRect || {}).top < 58 || !$breakpoint.isLaptop
              ? !$breakpoint.isLaptop
                ? 0.5
                : 1
              : intersectionRatio
          )})) drop-shadow(-4px -3px 4px hsl(215, 46%, 75%, ${stepper(
            0.025,
            0,
            (boundingClientRect || {}).top < 58 || !$breakpoint.isLaptop
              ? !$breakpoint.isLaptop
                ? 0.5
                : 1
              : intersectionRatio
          )}))`,
          transform: !$breakpoint.isLaptop
            ? 'translate3d(5.76px,5.76px,0)'
            : undefined,
        }"
      >
        <div
          class="h-148 lg:h-360 w-[max(150px,70%)] lg:w-[505px] rounded-[18px] bg-surface-default z-1 relative"
        >
          <FadeTransition>
            <div
              :key="currentItem"
              class="w-full h-full"
              v-on="
                !$breakpoint.isLaptop
                  ? undefined
                  : {
                      mouseenter: () => $emit('image-hovered', true),
                      mouseout: () => $emit('image-hovered', false),
                    }
              "
            >
              <Img
                :src="`static/png/landing-page/use-cases/presentation/view/home.png`"
                :alt="`Home view`"
                class="h-full"
                @load:success="$emit('image-loaded')"
              />
            </div>
          </FadeTransition>
        </div>
      </div>
    </div>
  </Intersection>
</template>
