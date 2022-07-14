<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  name: 'LandinPageTempPricing',
  components: {},
  setup() {
    const em = (text: string) =>
      `<em class="text-[#FFD966] not-italic">${text}</em>`

    const content = `All the features in Crowd beta are ${em(
      'completely free ($0)'
    )} to use ${em(
      'until our product launch'
    )} in September, after which users will have to pay a fee to access our premium features.`

    return { content }
  },
})
</script>

<template>
  <section
    id="pricing"
    class="mb-160 bg-[#1A1C1D] rounded-lg p-40 grid justify-center max-w-[914px] mx-auto text-center"
  >
    <h2
      class="font-sf-pro-display text-[32px] leading-[52.5px] font-semibold text-surface-default mb-8"
    >
      Affordable pricing
    </h2>

    <VHTML
      :text="content"
      tag="p"
      class="font-sf-pro-display text-display-small mb-32 text-surface-default"
    />

    <Button
      primary
      size="large"
      class="!border-none mx-auto w-fit"
      to="/auth/sign-up"
    >
      Try our beta for free
    </Button>
  </section>
</template>
