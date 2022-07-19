<script lang="ts">
import { computed, defineComponent, ref, watch } from '@vue/composition-api'
import Slider from './Slider/index.vue'
import Dropdown from './Dropdown/index.vue'
import Button from '~/components/Base/Button/index.vue'
import { UserData } from '~/server-middleware/types'

import type { OnboardingVideoState } from '~/store/onboarding-videos'

export default defineComponent({
  name: 'AppOnboard',
  components: { Slider, Button, Dropdown },
  setup(_, { root: { $user, $store } }) {
    const onboardStep = ref(0)

    const dismissing = ref(false)

    const state = computed(() => {
      return $store.state['onboarding-videos'] as OnboardingVideoState
    })

    const rating = computed(() => state.value.items)

    const ratingLength = computed(
      () =>
        Object.keys(rating.value).length - state.value.hiddenIndexes.length - 2
    )

    const increaseStep = () => {
      onboardStep.value = Math.min(onboardStep.value + 1, ratingLength.value)
    }

    const decreaseStep = () => {
      onboardStep.value = Math.max(onboardStep.value - 1, 0)
    }

    const dismissGuide = async () => {
      dismissing.value = true

      await $user.update({
        showDashboardGuide: false,
      } as UserData)

      dismissing.value = true
    }

    const getRating = async () => {
      await $store.dispatch('onboarding-videos/getItems')
    }

    getRating()

    watch(
      () => ratingLength.value,
      () => {
        onboardStep.value = 0
      }
    )

    const rate = async (
      key: 'main' | `video${'1' | '2' | '3' | '4'}`,
      value: boolean
    ) => {
      await $store.dispatch('onboarding-videos/rateItem', {
        [key]: value,
      })
    }

    return {
      onboardStep,
      dismissing,
      rating,
      ratingLength,
      increaseStep,
      decreaseStep,
      dismissGuide,
      getRating,
      rate,
    }
  },
})
</script>

<template>
  <section
    v-if="ratingLength + 1"
    class="bg-surface-default py-20 rounded-lg shadow-card mb-32 overflow-hidden"
    :class="{ 'pointer-events-none': dismissing }"
  >
    <h3
      class="flex items-center justify-between w-full text-heading font-semibold px-20"
    >
      <span class="flex-grow"> Welcome to crowd </span>

      <Dropdown
        path="main"
        dismiss-title="Dismiss welcome guide"
        :dismissing="dismissing"
        @on-dismiss="dismissGuide"
      />
    </h3>

    <p class="my-20 px-20">
      We have curated this videos to help you get the best out of Crowd. Click
      the 3 dot icon at the top right to dismiss this welcome guide once you're
      done.
    </p>

    <Slider v-model="onboardStep" />

    <div
      :key="ratingLength"
      class="px-20"
      @keydown.prevent.up="increaseStep"
      @keydown.prevent.right="increaseStep"
      @keydown.prevent.down="decreaseStep"
      @keydown.prevent.left="decreaseStep"
    >
      <PButtonGroup segmented>
        <Button
          icon="ChevronLeftMinor"
          :disabled="onboardStep < 1"
          @click="decreaseStep"
        />

        <Button
          icon="ChevronRightMinor"
          :disabled="onboardStep >= ratingLength"
          @click="increaseStep"
        />
      </PButtonGroup>
    </div>
  </section>
</template>
