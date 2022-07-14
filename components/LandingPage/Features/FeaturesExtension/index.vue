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
  <section class="mb-162 w-full">
    <h2
      class="font-sf-pro-display text-[32px] font-semibold leading-[52.5px] mb-24 text-center"
    >
      Building great products is easier than ever
    </h2>

    <div class="flex space-x-34 justify-between max-w-[1100px] mx-auto">
      <div class="pt-40">
        <ul class="grid gap-y-20">
          <li
            v-for="(feature, i) in features"
            :key="i"
            class="flex space-x-10 text-display-small font-sf-pro-display items-center"
          >
            <FeatureExtensionCheck />

            <span>
              {{ feature }}
            </span>
          </li>
        </ul>

        <div class="relative">
          <p class="uppercase text-sub-heading mt-20 font-semibold">And more...</p>

          <Img
            src="static/png/landing-page/features-extension/arrow.png"
            alt="Scribble arrow vector"
            class="absolute right-[-50px] top-0"
          />
        </div>
      </div>

      <div
        class="h-[582px] lg:w-[730px] w-full rounded-[29.14px] pl-46 pt-55"
        :style="{
          'background-image':
            'linear-gradient(124.19deg, #F0F6FF 0%, #FBFBFB 100%)',
        }"
      >
        <div>
          <Img
            src="static/png/landing-page/use-cases/presentation/view/home"
            alt="Home"
          />
        </div>
      </div>
    </div>
  </section>
</template>
