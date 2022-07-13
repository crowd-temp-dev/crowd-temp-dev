<template>
  <section class="text-center relative pt-108 w-full">
    <h2 class="landing-page-title md:w-[750px] mb-24 mx-auto">
      Make informed decisions and build better products with Crowd
    </h2>

    <h3 class="landing-page-subtitle mb-25 mx-14 md:mx-auto">
      A usability testing platform built to help you get useful feedback about
      your products
    </h3>

    <div
      class="flex justify-center space-y-12 md:space-y-0 md:space-x-12 md:grid-cols-2 mb-32"
    >
      <TextField
        class="lg:min-w-[288px] min-w-full min-h-[48px]"
        placeholder="Enter your email address"
        height="48px"
      />

      <Button primary size="large" to="/auth/sign-up">
        Get early access
      </Button>
    </div>

    <Ipad />

    <StickyNoteWrapper />
  </section>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import Ipad from './Ipad/index.vue'
import StickyNoteWrapper from './StickyNoteWrapper/index.vue'
import Button from '~/components/Base/Button/index.vue'
import TextField from '~/components/Base/TextField/index.vue'

export default defineComponent({
  name: 'LandingPageHero',
  components: { Button, Ipad, StickyNoteWrapper, TextField },
  setup() {},
})
</script>

<style scoped></style>
