<template>
  <section class="w-750 mx-auto grid justify-items-center mb-100">
    <span id="contact" class="sr-only">Contact us</span>
    <Img
      src="static/png/landing-page/cta/poster-vector"
      alt="Vector image of a person sitting and drinking a hot drink"
      :width="$breakpoint.isMobile ? 228.37 : 399"
      :height="$breakpoint.isMobile ? 124.48 : 224.48"
      class="w-[228.37px] md:w-399 h-[124.48px] md:h-[224.48px]"
    />

    <h2 class="landing-page-title px-8 mt-24 mb-8">
      Start building great products
    </h2>

    <p class="mb-25 font-sf-pro-display text-display-small">
      Feel free to reach out to us if you need any support or have any questions
    </p>

    <Button to="#" size="large"> Contact our support team </Button>
  </section>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import Button from '~/components/Base/Button/index.vue'

export default defineComponent({
  name: 'LandingPageCta',
  components: { Button },
})
</script>

<style scoped></style>
