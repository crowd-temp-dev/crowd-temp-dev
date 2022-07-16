<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import StickyNoteWrapper from './StickyNoteWrapper/index.vue'
import Button from '~/components/Base/Button/index.vue'

export default defineComponent({
  name: 'LandingPageHero',
  components: { Button, StickyNoteWrapper },
  // setup() {
  //   const em = (text: string) =>
  //     `<em class='not-italic text-base-primary'>${text}</em>`

  //   const title = `Build ${em('better')} products and ${em(
  //     'grow'
  //   )} customer ${em('loyalty')} with Crowd`

  //   return { title }
  // },
})
</script>

<template>
  <section class="text-center relative pt-108 w-full mb-80 lg:mb-110">
    <div
      class="landing-page-title !leading-[28px] lg:!leading-[54px] !text-[24px] lg:!text-[42px] md:w-[775px] mb-24 mx-auto text-center"
    >
      <!-- <VHTML tag="h2" :text="title" /> -->
      <h2>Build better products and grow customer loyalty with insights</h2>
    </div>

    <p class="landing-page-subtitle mb-34 mx-14 md:mx-auto !max-w-[620px] px-14 lg:px-0">
      Make informed decisions, drive product growth and increase customer
      loyalty by collecting useful insights anytime, anywhere.
    </p>

    <Button primary size="large" to="/auth/sign-up">
      Try our beta for free
    </Button>

    <StickyNoteWrapper />
  </section>
</template>
