<template>
  <section class="mt-100 grid justify-items-center">
    <h2 class="mx-auto max-w-[750px] landing-page-title mb-24">
      All you need to test your product
    </h2>

    <h3 class="landing-page-subtitle max-w-[450px] md:max-w-full">
      With founders, designers, researchers and product teams in mind, we've
      built a suite of solutions to help tackle different product research cases
      and we'll keep adding more!
    </h3>

    <FeatureGroup />

    <Button primary size="large" to="#"> Start with a test now </Button>
  </section>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import FeatureGroup from './FeatureItemGroup/index.vue'
import Button from '~/components/Base/Button/index.vue'

export default defineComponent({
  name: 'LandingPageFeatures',
  components: { Button, FeatureGroup },
  setup() {},
})
</script>

<style scoped></style>
