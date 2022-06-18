<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import Slider from './Slider/index.vue'
import Button from '~/components/Base/Button/index.vue'
import Dropdown from '~/components/Base/Dropdown/index.vue'
import Spinner from '~/components/Base/Spinner/index.vue'
import { UserData } from '~/server-middleware/types'

export default defineComponent({
  name: 'AppOnboard',
  components: { Slider, Button, Dropdown, Spinner },
  setup(_, { root: { $user } }) {

    const onboardStep = ref(0)

    const dismissing = ref(false)

    const increaseStep = () => {
      onboardStep.value = Math.min(onboardStep.value + 1, 4)
    }

    const decreaseStep = () => {
      onboardStep.value = Math.max(onboardStep.value - 1, 0)
    }

    const dismissGuide = async () => {
      dismissing.value = true

      await $user.update({
        showDashboardGuide: false
      } as UserData)

      dismissing.value = true
    }

    return { onboardStep, increaseStep, decreaseStep, dismissGuide, dismissing }
  },
})
</script>

<template>
  <section
    class="bg-surface-default py-20 rounded-lg shadow-card mb-32 overflow-hidden"
    :class="{ 'pointer-events-none': dismissing }"
  >
    <h3
      class="flex items-center justify-between w-full text-heading font-semibold px-20"
    >
      <span class="flex-grow"> Welcome to crowd </span>

      <Dropdown :offset="[4, -2]">
        <template #default="{ events, active }">
          <button
            tabindex="0"
            type="button"
            class="outline-none ring-offset-2 focus:ring-2 focus:ring-action-primary-default rounded-full transition-colors duration-[250ms]"
            :class="{
              'ring-2 ring-action-primary-default bg-background-selected':
                active,
            }"
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
          <div class="py-8">
            <div class="dropdown-item">
              Was this helpful?

              <div class="flex-centered ml-16">
                <span
                  v-for="i in 2"
                  :key="i"
                  role="menuitem"
                  class="pseudo-focus flex-centered h-40 w-40 rounded-full pseudo-focus:bg-action-primary-default"
                  v-on="events"
                >
                  <PIcon
                    :source="i === 1 ? 'ThumbsUpMinor' : 'ThumbsDownMinor'"
                    class="fill-icon-default"
                  />
                </span>
              </div>
            </div>

            <div
              role="menuitem"
              class="dropdown-item pseudo-focus"
              v-on="events"
              @click="dismissGuide"
            >
              Dismiss welcome guide
            </div>
          </div>
        </template>
      </Dropdown>
    </h3>

    <p class="my-20 px-20">
      We have curated this videos to help you get the best out of Crowd. Click
      the 3 dot icon at the top right to dismiss this welcome guide once you're
      done.
    </p>

    <Slider v-model="onboardStep" />

    <div
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
          :disabled="onboardStep >= 4"
          @click="increaseStep"
        />
      </PButtonGroup>
    </div>
  </section>
</template>
