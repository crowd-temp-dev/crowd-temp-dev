<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import FeatureItem from '../FeatureItem/index.vue'
import { FeatureTitle } from '~/types'
import Intersection from '~/components/Base/Intersection/index.vue'
import { stepper } from '~/utils'

export default defineComponent({
  name: 'LandingPageFeatureItemGroup',
  components: { FeatureItem, Intersection },
  setup() {
    return {
      items: [
        'Simple survey',
        'Card sorting',
        'Design survey',
        'Five second test',
        'Website evaluation',
        'Prototype evaluation',
        'Preference test',
      ] as FeatureTitle[],
      stepper,
    }
  },
})
</script>

<template>
  <Intersection
    v-slot="{ intersectionRatio, isIntersecting }"
    :disabled="$breakpoint.isMobile"
    thresholds="100"
    :config="{ rootMargin: '-58px 0px 0px 0px' }"
  >
    <ul
      class="md:h-[537px] md:w-[837.97px] mx-auto mt-24 md:mt-32 grid gap-y-10 md:flex md:flex-wrap justify-between px-12 md:px-4 isolate"
    >
      <FeatureItem
        v-for="(item, i) in items"
        :key="item"
        :title="item"
        :class="
          $breakpoint.isMobile
            ? {
                'order-1': i === 1,
                'order-2': i === 0,
                'order-3': i === 3,
                'order-4': i === 2,
                'order-5': i === 4,
                'order-6': i === 5,
                'order-7': i === 6,
              }
            : {
                'rotate-[-5.29deg] mb-[32.27px] translate-y-16': i === 0,
                'mb-46 -translate-x-8': i === 1,
                'rotate-[2.88deg] mb-[19.55px] translate-x-12': i === 2,
                'rotate-[-4.4deg] mb-[23.89px] translate-x-8': i === 3,
                'rotate-[-2.56deg] mb-[44.59px]': i === 4,
                'rotate-[5.1deg] translate-x-8 translate-y-8': i === 5,
                '-translate-y-36 translate-x-[-50%] relative left-[50%]':
                  i === 6,
                '!duration-[0ms]': true,
              }
        "
        :style="
          $breakpoint.isMobile ||
          !(isIntersecting && i < 6 && intersectionRatio < 1)
            ? undefined
            : {
                willChange: 'transform',

                transform:
                  i === 0
                    ? `translate3d(0,${stepper(
                        16,
                        0,
                        intersectionRatio
                      )}px,0) rotate(${stepper(
                        -5.29,
                        0,
                        intersectionRatio
                      )}deg)`
                    : i === 1
                    ? `translate3d(${stepper(-8, 0, intersectionRatio)}px,0,0)`
                    : i === 2
                    ? `translate3d(${stepper(
                        12,
                        0,
                        intersectionRatio
                      )}px,0,0) rotate(${stepper(
                        2.88,
                        0,
                        intersectionRatio
                      )}deg)`
                    : i === 3
                    ? `translate3d(${stepper(
                        8,
                        0,
                        intersectionRatio
                      )}px,0,0) rotate(${stepper(
                        -4.4,
                        0,
                        intersectionRatio
                      )}deg)`
                    : i === 4
                    ? `rotate(${stepper(-2.56, 0, intersectionRatio)}deg)`
                    : i === 5
                    ? `translate3d(${stepper(
                        8,
                        0,
                        intersectionRatio
                      )}px,${stepper(
                        8,
                        0,
                        intersectionRatio
                      )}px,0) rotate(${stepper(5.1, 0, intersectionRatio)}deg)`
                    : '',
              }
        "
      />
    </ul>
  </Intersection>
</template>
