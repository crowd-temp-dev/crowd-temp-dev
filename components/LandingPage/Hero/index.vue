<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import Ipad from './Ipad/index.vue'
import StickyNoteWrapper from './StickyNoteWrapper/index.vue'
import Button from '~/components/Base/Button/index.vue'
import TextField from '~/components/Base/TextField/index.vue'
import VHTML from '~/components/Base/VHTML/index.vue'

export default defineComponent({
  name: 'LandingPageHero',
  components: { Button, Ipad, StickyNoteWrapper, TextField, VHTML },
  setup() {
    const emphasis = (text: string) =>
      `<em class='not-italic text-base-primary'>${text}</em>`

    const title = [
      'Build ',
      emphasis('better'),
      ' products and ',
      emphasis('grow'),
      ' customer ',
      emphasis('loyalty'),
      ' with Crowd',
    ].join('')

    return { title }
  },
})
</script>

<template>
  <section class="text-center relative pt-108 w-full">
    <div class="landing-page-title md:w-[775px] mb-24 mx-auto text-center !text-[36px]">
      <VHTML
        tag="h2"
        :text="title"
      />
    </div>

    <h3 class="landing-page-subtitle mb-34 mx-14 md:mx-auto">
      Make informed decisions, drive product growth and increase customer
      loyalty by collecting useful insights anytime, anywhere.
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
