<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import FeatureGroup from './FeatureItemGroup/index.vue'

export default defineComponent({
  name: 'LandingPageFeatures',
  components: { FeatureGroup },
  setup() {},
})
</script>

<template>
  <section class="mt-80 lg:mt-100 grid justify-items-center lg:mb-160 mb-80">
    <h2
      id="features"
      class="mx-auto max-w-[750px] landing-page-title mb-8 lg:mb-24 !text-[22px] lg:!text-[32px]"
    >
      Variety of testing methods to choose from
    </h2>

    <h3 class="landing-page-subtitle max-w-[450px] md:max-w-full">
      We've built a suite of solutions to help tackle different product insight
      scenarios!
    </h3>

    <FeatureGroup />
  </section>
</template>
