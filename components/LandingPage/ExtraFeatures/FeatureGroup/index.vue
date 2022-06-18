<template>
  <ul
    class="flex flex-col md:flex-row space-y-10 md:space-y-0 md:space-x-32 mt-4 mb-32 px-8 md:px-0"
  >
    <li
      v-for="content in contents"
      :key="content.title"
      class="rounded-[5px] p-20 w-full md:w-268 bg-[#FAFAFA] shadow-divide-bottom"
    >
      <h3 class="font-semibold text-heading">
        {{ content.title }}
      </h3>

      <h4 class="text-body my-8">
        {{ content.subtitle }}
      </h4>

      <NuxtLink to="#" class="text-body text-action-primary-default">
        Learn more
      </NuxtLink>
    </li>
  </ul>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

type Title = 'Template library' | 'Great Pricing' | 'Easy to setup'

type Content = {
  title: Title
  subtitle: string
}

export default defineComponent({
  name: 'LandingPageExtraFeaturesGroup',
  components: {},
  setup() {
    const contents: Content[] = [
      {
        title: 'Template library',
        subtitle:
          'Create tests in less than 5 minutes and save time, using our ready made templates.',
      },
      {
        title: 'Great Pricing',
        subtitle:
          'Get started with our free forever plan and upgrade at low prices for premium features.',
      },
      {
        title: 'Easy to setup',
        subtitle:
          'We designed the test creation process to be super easy for varying use cases.',
      },
    ]

    return { contents }
  },
})
</script>

<style scoped lang="postcss"></style>
