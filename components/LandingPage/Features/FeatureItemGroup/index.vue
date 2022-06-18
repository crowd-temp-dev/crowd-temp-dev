<template>
  <ul
    class="md:h-[537px] md:w-[837.97px] mx-auto mt-24 md:mt-32 mb-36 md:mb-32 grid gap-y-10 md:flex md:flex-wrap justify-between px-8 md:px-4"
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
              'order-8': i === 7,
            }
          : {
              'rotate-[-5.29deg] mb-[32.27px] translate-y-16': i === 0,
              'mb-46 -translate-x-8': i === 1,
              'rotate-[2.88deg] mb-[19.55px] translate-x-12': i === 2,
              'rotate-[-4.4deg] mb-[23.89px] translate-x-8': i === 3,
              'rotate-[-2.56deg] mb-[44.59px]': i === 4,
              'rotate-[5.1deg] translate-x-8 translate-y-8': i === 5,
              '-translate-y-4': i === 6,
            }
      "
    />
  </ul>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import FeatureItem from '../FeatureItem/index.vue'
import { FeatureTitle } from '~/types'

export default defineComponent({
  name: 'LandingPageFeatureItemGroup',
  components: { FeatureItem },
  setup() {
    return {
      items: [
        'Simple survey',
        'Card sorting',
        'Design Survey',
        'Five second test',
        'Website evaluation',
        'Prototype evaluation',
        'Preference test',
        'Custom message',
      ] as FeatureTitle[],
    }
  },
})
</script>

<style scoped></style>
