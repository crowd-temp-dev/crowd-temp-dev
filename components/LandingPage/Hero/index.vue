<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import StickyNoteWrapper from './StickyNoteWrapper/index.vue'
import Button from '~/components/Base/Button/index.vue'
import VHTML from '~/components/Base/VHTML/index.vue'

export default defineComponent({
  name: 'LandingPageHero',
  components: { Button, StickyNoteWrapper, VHTML },
  setup() {
    const em = (text: string) =>
      `<em class='not-italic text-base-primary'>${text}</em>`

    const title = `Build ${em('better')} products and ${em(
      'grow'
    )} customer ${em('loyalty')} with Crowd`

    return { title }
  },
})
</script>

<template>
  <section class="text-center relative pt-108 w-full mb-110">
    <div class="landing-page-title !leading-[54px] !text-[42px] md:w-[775px] mb-24 mx-auto text-center">
      <VHTML tag="h2" :text="title" />
    </div>

    <p class="landing-page-subtitle mb-34 mx-14 md:mx-auto !max-w-[620px]">
      Make informed decisions, drive product growth and increase customer
      loyalty by collecting useful insights anytime, anywhere.
    </p>

    <Button primary size="large" to="/auth/sign-up">
      Try our beta for free
    </Button>

    <StickyNoteWrapper />
  </section>
</template>
