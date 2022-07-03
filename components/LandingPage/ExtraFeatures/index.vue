<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import FeatureGroup from './FeatureGroup/index.vue'
import Button from '~/components/Base/Button/index.vue'

export default defineComponent({
  name: 'LandingPageExtraFeatures',
  components: { FeatureGroup, Button },
})
</script>

<template>
  <section
    class="mt-84 md:mt-100 mb-80 md:mb-100 w-fit mx-auto grid justify-items-center"
  >
    <Img
      src="static/png/landing-page/extra-features/poster-vector"
      alt="Vector image of a person using a laptop and another walking with a drink"
      :width="$breakpoint.isMobile ? 234.67 : 400"
      :height="$breakpoint.isMobile ? 176 : 300"
      class="w-[234.67px] md:w-400 h-176 md:h-300"
    />

    <h2 class="landing-page-title w-280 !text-[22px] md:w-[667px] mb-4">
      Building great products is easier than ever
    </h2>

    <Img
      src="static/png/landing-page/extra-features/scribble-arrow"
      alt="Vector image of a scribbled arrow pointing down"
      :width="73.63"
      :height="73.63"
      class="w-[73.63px] h-[73.63px]"
    />

    <FeatureGroup />

    <Button primary to="/auth/sign-up" size="large">
      Get started for free
    </Button>
  </section>
</template>
