<script lang="ts">
import { computed, defineComponent, ref, PropType } from '@vue/composition-api'
import Dropdown from '~/components/Base/Dropdown/index.vue'
import Spinner from '~/components/Base/Spinner/index.vue'

import type { OnboardingVideoState } from '~/store/onboarding-videos'

type Path = 'main' | `video${'1' | '2' | '3' | '4' | '5'}`

export default defineComponent({
  name: 'AppOnboard',
  components: { Dropdown, Spinner },
  props: {
    path: {
      type: String as PropType<Path>,
      required: true,
    },
    dismissTitle: {
      type: String,
      default: 'Dismiss tutorial',
    },
    dismissing: Boolean,
  },
  setup(_props, { root: { $store } }) {
    const onboardStep = ref(0)

    const state = computed(() => {
      return $store.state['onboarding-videos'] as OnboardingVideoState
    })

    const rating = computed(() => state.value.items)

    const increaseStep = () => {
      onboardStep.value = Math.min(onboardStep.value + 1, 4)
    }

    const decreaseStep = () => {
      onboardStep.value = Math.max(onboardStep.value - 1, 0)
    }

    const updateItem = async (value: boolean) => {
      const getValue = Number(value)

      if (rating.value[_props.path] === getValue) {
        return
      }

      await $store.dispatch('onboarding-videos/rateItem', {
        key: _props.path,
        value: getValue,
      })
    }

    return {
      onboardStep,
      rating,
      increaseStep,
      decreaseStep,
      updateItem,
    }
  },
})
</script>

<template>
  <Dropdown :offset="[4, -2]" :disabled="dismissing">
    <template #default="{ events, active }">
      <button
        tabindex="0"
        type="button"
        class="outline-none ring-offset-2 focus:ring-2 focus:ring-action-primary-default rounded-full transition-colors duration-[250ms]"
        :class="{
          'ring-2 ring-action-primary-default bg-background-selected': active,
          'pointer-events-none': dismissing,
        }"
        :disabled="dismissing || undefined"
        v-on="events"
      >
        <div class="relative flex-centered">
          <PIcon
            source="HorizontalDotsMinor"
            class="shrink-0 text-icon-default fill-icon"
            :class="{ invisible: dismissing }"
          />

          <span
            class="absolute inset-0 !animate-spin text-icon-default flex-centered"
          >
            <Spinner v-if="dismissing" />
          </span>
        </div>
      </button>
    </template>

    <template #content="{ events }">
      <menu class="py-8">
        <div class="dropdown-item">
          Was it helpful?

          <div class="flex-centered ml-16">
            <span
              v-for="i in 2"
              :key="i"
              role="menuitem"
              class="pseudo-focus flex-centered h-40 w-40 rounded-full"
              :class="{
                [rating[path] === 1
                  ? '!text-action-primary-default pseudo-focus:!bg-action-primary-pressed/5'
                  : '!text-icon-default']: i === 1,
                [rating[path] === 0
                  ? '!text-base-critical pseudo-focus:!bg-action-critical-hovered/5'
                  : 'text-icon-default']: i === 2,
              }"
              v-on="events"
              @click="updateItem(i === 1)"
            >
              <PIcon
                :source="i === 1 ? 'ThumbsUpMinor' : 'ThumbsDownMinor'"
                class="fill-icon"
              />
            </span>
          </div>
        </div>

        <div
          role="menuitem"
          class="dropdown-item pseudo-focus"
          v-on="events"
          @click="$emit('on-dismiss', updateItem)"
        >
          {{ dismissTitle }}
        </div>
      </menu>
    </template>
  </Dropdown>
</template>
