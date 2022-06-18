<template>
  <div>
    <main
      class="grid items-center justify-center max-w-[1230px] mx-auto isolate min-h-screen h-fit mt-24 xs:mt-44 md:mt-60 grid-cols-1 px-8 md:px-0"
    >
      <Hero />

      <Features />

      <ExtraFeatures />

      <Feedback />

      <Pricing />

      <CTA />
    </main>

    <Footer />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import Hero from '~/components/LandingPage/Hero/index.vue'
import Features from '~/components/LandingPage/Features/index.vue'
import ExtraFeatures from '~/components/LandingPage/ExtraFeatures/index.vue'
import Feedback from '~/components/LandingPage/Feedback/index.vue'
import Pricing from '~/components/LandingPage/Pricing/index.vue'
import CTA from '~/components/LandingPage/CTA/index.vue'
import Footer from '~/components/LandingPage/Footer/index.vue'

export default defineComponent({
  name: 'LandingPageLayoutMarkup',
  components: { Hero, Features, ExtraFeatures, Feedback, Pricing, CTA, Footer },
  setup() {},
})
</script>

<style scoped></style>
