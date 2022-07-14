<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  watch,
} from '@vue/composition-api'
import UseCasesFooter from '../UseCases/Footer/index.vue'
import Presentation from '../UseCases/Presentation/index.vue'
import FavoriteTools from '../UseCases/FavoriteTools/index.vue'
import TempPricing from '../TempPricing/index.vue'
import FeaturesExtension from '../Features/FeaturesExtension/index.vue'
import Hero from '~/components/LandingPage/Hero/index.vue'
import Features from '~/components/LandingPage/Features/index.vue'
// import Feedback from '~/components/LandingPage/Feedback/index.vue'
// import Pricing from '~/components/LandingPage/Pricing/index.vue'
import CTA from '~/components/LandingPage/CTA/index.vue'
import Footer from '~/components/LandingPage/Footer/index.vue'
import { scrollToLandingPageHash } from '~/utils'

export default defineComponent({
  name: 'LandingPageLayoutMarkup',
  components: {
    Hero,
    Features,
    // Feedback,
    CTA,
    Footer,
    UseCasesFooter,
    Presentation,
    FavoriteTools,
    FeaturesExtension,
    TempPricing,
  },
  setup(_, { root }) {
    const hash = computed(() => root.$route.hash)

    watch(
      () => hash.value,
      (nv) => {
        scrollToLandingPageHash(nv, true)
      }
    )

    onMounted(() => {
      scrollToLandingPageHash(hash.value)
    })
  },
})
</script>

<template>
  <div>
    <main
      class="grid items-center justify-center isolate min-h-screen h-fit mt-24 xs:mt-44 md:mt-60 grid-cols-1 px-8 md:px-0"
    >
      <Hero />

      <div class="max-w-[1230px] mx-auto w-full">
        <Presentation />

        <FavoriteTools />
      </div>

      <UseCasesFooter />

      <Features />

      <FeaturesExtension class="max-w-[1230px] mx-auto" />

      <TempPricing />

      <!-- <Feedback /> -->

      <!-- <Pricing /> -->

      <CTA />
    </main>

    <Footer />
  </div>
</template>
