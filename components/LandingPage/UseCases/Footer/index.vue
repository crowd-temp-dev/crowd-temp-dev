<script lang="ts">
import { defineComponent } from '@vue/composition-api'

interface Item {
  image: string
  title: string
  subtitle: string
}

export default defineComponent({
  name: 'LandingPageUseCasesFooter',

  setup() {
    const img = (title: string) =>
      `/static/png/landing-page/use-cases/footer/${title}.png`
    const items: Item[] = [
      {
        image: img('1'),
        title: 'For Designers & Researchers',
        subtitle:
          'Quickly build, share, and gather actionable data from users to support wider product team needs fast.',
      },
      {
        image: img('2'),
        title: 'For Product Managers',
        subtitle:
          'Quickly build, share, and gather actionable data from users to support wider product team needs fast.',
      },
      {
        image: img('3'),
        title: 'For Product Marketers',
        subtitle:
          'Quickly build, share, and gather actionable data from users to support wider product team needs fast.',
      },
    ]
    return { items }
  },
})
</script>

<template>
  <section class="bg-surface-subdued">
    <h2
      class="font-sf-pro-display font-semibold text-[22px] lg:text-[36px] leading-[28px] lg:leading-[32px] px-16 text-center mt-100 mb-16"
    >
      Built for all kinds of teams
    </h2>

    <h3
      class="font-sf-pro-display text-[16px] leading-[25.5px] lg:text-display-small px-16 text-center mb-32"
    >
      We've cracked the code of getting awesome insights for product teams.
    </h3>

    <ul
      class="w-fit grid lg:grid-cols-3 gap-30 max-w-screen lg:max-w-[1110px] mx-auto mb-100 justify-items-center px-10 md:px-0"
    >
      <li
        v-for="(item, i) in items"
        :key="i"
        class="lg:max-w-[356px] shadow-2 rounded-lg bg-surface-default pt-32 lg:pt-40 pb-40 lg:pb-80 px-20"
      >
        <Img
          :src="item.image"
          alt="Vector image"
          class="min-h-[87px] w-[104.68px] lg:h-122 lg:w-150"
        />

        <h4
          class="font-sf-pro-display text-display-small lg:text-display-large-sm lg:text-[22px] font-semibold my-8 lg:my-24"
        >
          {{ item.title }}
        </h4>

        <p>
          {{ item.subtitle }}
        </p>
      </li>
    </ul>
  </section>
</template>
