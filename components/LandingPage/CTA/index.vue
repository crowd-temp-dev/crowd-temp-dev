<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import Button from '~/components/Base/Button/index.vue'

export default defineComponent({
  name: 'LandingPageCta',
  components: { Button },
})
</script>

<template>
  <section class="w-750 mx-auto grid justify-items-center mb-100">
    <h2 id="contact" class="sr-only">Contact us</h2>
    <Img
      src="static/png/landing-page/cta/poster-vector"
      alt="Vector image of a person sitting and drinking a hot drink"
      :width="$breakpoint.isMobile ? 228.37 : 399"
      :height="$breakpoint.isMobile ? 124.48 : 224.48"
      class="w-[228.37px] md:w-399 h-[124.48px] md:h-[224.48px]"
    />

    <h3 class="landing-page-title mt-24 mb-8 px-24 lg:px-0">
      Start building great products
    </h3>

    <p
      class="mb-25 font-sf-pro-display text-display-small-sm px-24 lg:px-0 text-center lg:text-display-small"
    >
      Feel free to reach out to us if you need any support or have any questions
    </p>

    <Button to="#" size="large"> Contact our support team </Button>
  </section>
</template>
