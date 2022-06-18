<template>
  <section class="text-center relative pt-108 w-full">
    <h2 class="landing-page-title md:w-[750px] mb-24 mx-auto">
      Make informed decisions and build better products with Crowd
    </h2>

    <h3 class="landing-page-subtitle mb-25 mx-14 md:mx-auto">
      A usability testing platform built you to help you get useful feedback
      about your products
    </h3>

    <Button primary size="large" to="/auth/sign-up" class="mb-33">
      Get started for free
    </Button>

    <Ipad />

    <StickyNoteWrapper />
  </section>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import Ipad from './Ipad/index.vue'
import StickyNoteWrapper from './StickyNoteWrapper/index.vue'
import Button from '~/components/Base/Button/index.vue'

export default defineComponent({
  name: 'LandingPageHero',
  components: { Button, Ipad, StickyNoteWrapper },
  setup() {},
})
</script>

<style scoped></style>
