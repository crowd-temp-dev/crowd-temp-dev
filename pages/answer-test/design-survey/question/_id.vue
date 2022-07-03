<template>
  <TwoToneBg>
    <template #left>
      <div class="pt-108 xl:pt-198 px-50 justify-center flex w-full pb-64">
        <!-- <div
          class="w-full max-w-[620px] transition-all ease-[var(--ease-back-out)]"
          :class="{
            'rounded-lg bg-surface-default shadow-2 p-20 min-h-[445px]  min-w-full':
              !expanded,
            'bg-sky-light fixed top-56 left-0 min-w-full min-h-[calc(100%-56px)] z-20':
              expanded,
          }"
        >
          <div
            class="flex items-center justify-between"
            :class="{
              'bg-surface-default shadow-divide-header h-76 px-64 mb-52':
                expanded,
            }"
          >
            <h2
              class="font-semibold text-heading"
              :class="{ 'flex-grow text-center ml-64': expanded }"
            >
              Watch the video below for this question
            </h2>

            <Button
              primary
              class="shrink-0"
              :autofocus="expanded"
              @click="expanded = !expanded"
            >
              {{ expanded ? 'Minimize' : 'Expand' }}
            </Button>
          </div>

          <div class="py-10">
            <div
              class="h-350 rounded bg-base-on-surface mx-auto"
              :class="{ 'w-full ': !expanded, 'w-[1084px]': expanded }"
            ></div>
          </div>
        </div> -->

        <Transition
          :enter-class="
            expanded ? 'scale-[0.95] opacity-0' : 'scale-[1.05] opacity-0'
          "
          :enter-active-class="`transition-[opacity,transform] duration-[250ms] ${
            expanded ? 'origin-left' : 'origin-right'
          }`"
          :leave-to-class="
            expanded ? 'scale-[1.05] opacity-5' : 'scale-[0.95] opacity-5'
          "
          :leave-active-class="`transition-[opacity,transform] ${
            expanded ? 'origin-right' : 'origin-left'
          }`"
          :duration="{
            leave: 70,
          }"
        >
          <div
            :key="`expanded-${expanded}`"
            class="w-full max-w-[620px] transform-gpu ease-[var(--ease-back-out)]"
            :class="{
              'rounded-lg bg-surface-default shadow-2 p-20': !expanded,
              'bg-sky-light fixed top-56 left-0 min-w-full min-h-[calc(100%-56px)] z-20':
                expanded,
            }"
          >
            <div
              class="flex items-center justify-between"
              :class="{
                'bg-surface-default shadow-divide-header h-76 px-64 mb-52':
                  expanded,
              }"
            >
              <h2
                class="font-semibold text-heading"
                :class="{ 'flex-grow text-center ml-64': expanded }"
              >
                Watch the video below for this question
              </h2>

              <Button
                primary
                class="shrink-0"
                :autofocus="expanded"
                @click="expanded = !expanded"
              >
                {{ expanded ? 'Minimize' : 'Expand' }}
              </Button>
            </div>

            <div class="py-10">
              <div
                class="h-350 rounded bg-base-on-surface mx-auto"
                :class="{ 'w-full ': !expanded, 'w-[1084px]': expanded }"
              ></div>
            </div>
          </div>
        </Transition>

        <!-- audio file -->
        <div v-if="false" class="shadow-2 rounded-lg p-20 bg-surface-default">
          <strong class="mb-20 text-heading block">
            Listen to the audio below for this question
          </strong>

          <div
            class="min-h-[254px] grid grid-rows-[1fr,auto] bg-[#FBFAFA] rounded-[5px] p-20"
          >
            <div class="flex h-full items-end">
              <Img
                src="/png/answer-test/radio-wave.png"
                :height="50"
                class="h-50"
              />
            </div>

            <div class="h-50 mb-16 mt-46 flex items-center">
              <Button
                class="h-50 w-50 p-0 rounded-full !shadow-none shrink-0"
                primary
              >
                <div class="ml-2">
                  <PIcon source="PlayMinor" class="text-white fill-icon" />
                </div>
              </Button>

              <div class="flex items-center flex-grow w-full ml-10">
                <p class="minutes-mark">
                  {{ `00.00` }}
                </p>

                <PRangeSlider
                  id="slider"
                  v-model="range"
                  label="Seek audio"
                  label-hidden
                  output
                  class="range-slider"
                />

                <p class="minutes-mark">
                  {{ `01.30` }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <!-- </audio file> -->

        <!-- multiple expand -->
        <div v-if="false">
          <strong class="mb-10 text-heading block">
            Select your preferred version
          </strong>

          <ul class="grid grid-cols-2 gap-20 w-full">
            <li v-for="i in 4" :key="i" class="w-full">
              <div>
                <strong> Version {{ i }} </strong>

                <Button primary> Expand </Button>
              </div>

              <div class="h-318 bg-black"></div>

              <div>
                <p>Click to select</p>
              </div>
            </li>
          </ul>
        </div>
        <!-- </multiple expand> -->
      </div>
    </template>

    <template #right>
      <div
        class="pt-108 xl:pt-198 flex justify-center px-32 pb-64 w-full transition-opacity"
        :class="{ 'opacity-0': expanded }"
      >
        <div class="w-full max-w-[435px]">
          <h2 class="mb-8 font-semibold text-heading">Question 1</h2>

          <TextField
            label="This is a short text question?"
            class="mb-26 w-full max-w-[435px]"
          />

          <Button primary> Continue </Button>
        </div>
      </div>
    </template>
  </TwoToneBg>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import { Layout } from '~/types'
import TwoToneBg from '@/components/AnswerTest/TwoToneBg/index.vue'
import Button from '~/components/Base/Button/index.vue'

export default defineComponent({
  name: 'AppSettingsBillingPage',
  components: { TwoToneBg, Button },
  layout: 'answer-test' as Layout,
  transition: 'page-transition-fade',
  setup() {
    const expanded = ref(false)

    const range = ref(0)

    return { expanded, range }
  },

  head: {
    title: 'Design survey question',
  },
})
</script>

<style scoped lang="postcss">
.range-slider {
  @apply w-full mx-10;
}

.range-slider >>> .Polaris-RangeSlider-SingleThumb__InputWrapper::after {
  background-image: none;
  background-color: #fff;
  border-right: 0.4rem #fff solid;
}

.minutes-mark {
  @apply font-mulish text-[14px] leading-[17.57px] text-[#A4A4A4];
}
</style>
