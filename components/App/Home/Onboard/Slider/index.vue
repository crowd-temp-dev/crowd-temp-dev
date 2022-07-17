<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api'
import Dropdown from '../Dropdown/index.vue'
import Button from '~/components/Base/Button/index.vue'
import { OnboardingVideoState } from '~/store/onboarding-videos'

type Step = 0 | 1 | 2 | 3 | 4

type TranslateXClass =
  | 'translate-x-20'
  | 'translate-x-[-576px]'
  | 'translate-x-[-1172px]'
  | 'translate-x-[-1768px]'
  | 'translate-x-[-2364px]'

type Pedal = {
  icon: 'ChevronLeftMinor' | 'ChevronRightMinor'
  callback: () => void
  disabled: boolean
}

export default defineComponent({
  name: 'AppOnboardSlider',
  components: { Button, Dropdown },
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  props: {
    modelValue: {
      type: Number as () => Step,
      default: 0,
    },
  },
  setup(_props, { emit, root: { $store } }) {
    const modelSync = computed({
      get() {
        return _props.modelValue
      },
      set(val: Step) {
        if (typeof val === 'number') {
          emit('update:modelValue', val)
        }
      },
    })

    const state = computed(() => {
      return $store.state['onboarding-videos'] as OnboardingVideoState
    })

    const rating = computed(() => {
      return Object.fromEntries(
        Object.entries(state.value.items)
      )
    })

    const ratingLength = computed(()=> Object.keys(rating.value).length -2)

    const translateXClass = computed<TranslateXClass>(() => {
      switch (modelSync.value) {
        case 1:
          return 'translate-x-[-576px]'
        case 2:
          return 'translate-x-[-1172px]'
        case 3:
          return 'translate-x-[-1768px]'
        case 4:
          return 'translate-x-[-2364px]'
        default:
          return 'translate-x-20'
      }
    })

    const pedals = computed<Pedal[]>(() => [
      {
        icon: 'ChevronLeftMinor',
        callback: () =>
          (modelSync.value = Math.max(modelSync.value - 1, 0) as Step),
        disabled: modelSync.value < 1,
      },
      {
        icon: 'ChevronRightMinor',
        callback: () =>
          (modelSync.value = Math.min(modelSync.value + 1, ratingLength.value) as Step),
        disabled: modelSync.value >= ratingLength.value,
      },
    ])

    return { modelSync, translateXClass, pedals, rating, ratingLength }
  },
})
</script>

<template>
  <div class="relative isolate group">
    <ul
      class="mb-20 flex space-x-16 transition-transform transform-gpu duration-300 spring-ease"
      :class="[translateXClass]"
    >
      <template v-for="i in 5">
        <li
          v-if="rating[`video${i}`] > -2"
          :key="i"
          class="h-182 w-[580px] shadow-2 rounded-lg flex shrink-0"
        >
          <!-- image -->
          <div
            class="relative flex items-center justify-center rounded-l-lg overflow-hidden w-fit shrink-0"
          >
            <Img
              src="static/png/app/home/onboard/poster"
              alt="Poster"
              :width="191"
              :height="182"
              class="w-191 h-182"
            />

            <button class="play-button" type="button" title="play">
              <span>
                <PIcon source="PlayMinor" class="h-28 w-27 ml-4 fill-icon" />
              </span>
            </button>
          </div>

          <div class="flex-grow p-20">
            <h4
              class="flex items-center justify-between w-full text-heading font-semibold"
            >
              <span class="flex-grow"> Getting started with Crowd </span>

              <Dropdown
                :path="`video${i}`"
              />
            </h4>

            <p class="text-[#212B36] my-20">
              A quick overview how crowd works and the different features it
              offers
            </p>

            <Button> Learn more </Button>
          </div>
        </li>
      </template>
    </ul>

    <!-- <div
      aria-hidden="true"
      class="absolute h-[calc(100%-16px)] w-[calc(100%-16px)] max-w-app left-8 top-8 flex items-center justify-between opacity-0 delay-300 duration-300 group-hover:opacity-100 transition-opacity pointer-events-none"
    >
      <button
        v-for="(pedal, i) in pedals"
        :key="i"
        :disabled="pedal.disabled ? 'disabled' : undefined"
        tabindex="-1"
        type="button"
        class="pedal-arrow fill-before rounded"
        :class="{
          'grayscale pointer-events-none opacity-0': pedal.disabled,
          'pointer-events-auto': !pedal.disabled,
          //'rounded-r-lg': i === 0,
          //'rounded-l-lg': i === 1,
        }"
        @click="pedal.callback"
      >
        <PIcon
          :source="pedal.icon"
          class="size-icon text-[32px] fill-icon fill-icon-default"
        />
      </button>
    </div> -->
  </div>
</template>

<style scoped lang="postcss">
.play-button {
  @apply w-60 h-60 rounded-full text-white supports-backdrop-filter:backdrop-blur-[10px] supports-backdrop-filter:bg-black/40 not-supports-backdrop-filter:bg-black/80 border-none shadow-none absolute inline-flex items-center justify-center supports-backdrop-filter:hover:bg-black/60 not-supports-backdrop-filter:hover:bg-black/90 transition-[background-color,box-shadow] supports-backdrop-filter:active:bg-black/20 not-supports-backdrop-filter:active:bg-black/60 outline-none focus:ring-2 ring-action-primary-default;
}

.pedal-arrow {
  @apply h-full w-56 flex items-center justify-center relative transform-gpu transition-[transform,opacity,box-shadow] active:scale-[0.99] before:bg-current before:-z-1 before:absolute before:inset-0 before:transition-opacity before:opacity-30 hover:before:opacity-75 active:before:opacity-90 cursor-pointer outline-none focus:ring-2 ring-offset-2 ring-action-primary-default disabled:ring-opacity-0 text-white before:bg-black;
}
</style>
