<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import FeatureExtensionCheck from '~/components/Base/Icons/FeatureExtensionCheck.vue'

export default defineComponent({
  name: 'LandinPageFeaturesExtension',
  components: { FeatureExtensionCheck },
  setup() {
    const features = [
      'Access to template library',
      'Create notes from responses',
      'Export results as PDF or CSV',
      'Easy test setup',
      'Collaborate with team members',
    ]

    return { features }
  },
})
</script>

<template>
  <section class="mb-80 lg:mb-162 w-full">
    <div class="max-w-[274px] sm:max-w-[500px] lg:max-w-[initial] text-center mx-auto">
      <h2
        class="font-sf-pro-display text-[22px] lg:text-[32px] font-semibold leading-[28px] lg:leading-[52.5px] mb-8 lg:mb-24 text-center"
      >
        Building great products is easier than ever
      </h2>

      <h3 class="lg:sr-only font-sf-pro-display text-[16px] leading-[25.5px]">
        We've built a suite of solutions to help tackle different product
        insight scenarios!
      </h3>
    </div>

    <div
      class="flex flex-wrap lg:flex-nowrap lg:space-x-34 justify-between sm:max-w-[500px] lg:max-w-[1100px] mx-auto"
    >
      <div class="pt-24 lg:pt-40">
        <ul class="grid gap-y-20 px-20 lg:px-0">
          <li
            v-for="(feature, i) in features"
            :key="i"
            class="flex space-x-10 text-display-small-sm lg:text-display-small font-sf-pro-display items-center"
          >
            <FeatureExtensionCheck />

            <span>
              {{ feature }}
            </span>
          </li>
        </ul>

        <div class="relative">
          <p
            class="uppercase text-sub-heading mt-20 font-semibold px-20 lg:px-0 mb-24 lg:mb-0"
          >
            And more...
          </p>

          <Img
            v-if="$breakpoint.isLaptop"
            src="static/png/landing-page/features-extension/arrow.png"
            alt="Scribble arrow vector"
            class="absolute right-[-50px] top-0 w-74 h-74"
          />
        </div>
      </div>

      <div class="px-10 lg:px-0 w-full lg:w-[initial]">
        <div
          class="h-240 lg:h-[582px] lg:w-[730px] w-full rounded-[12px] lg:rounded-[29.14px] pl-[18.9px] lg:pl-46 pt-[22.6px] lg:pt-55"
          :style="{
            'background-image':
              'linear-gradient(124.19deg, #F0F6FF 0%, #FBFBFB 100%)',
          }"
        >
          <div>
            <Img
              src="static/png/landing-page/use-cases/presentation/view/home"
              alt="Home"
              class="lg:max-w-[505px] w-[207.53px] h-[148px] lg:h-[initial] lg:w-[initial]"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
