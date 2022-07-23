<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api'
import Button from '~/components/Base/Button/index.vue'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'

type Step = {
  title: 'Create test' | 'Recruit' | 'View Results'
  icon: 'CirclePlusMinor' | 'CustomerPlusMajor'
  active: boolean
  done: boolean
  disabled: Boolean
  select: Function
}

export default defineComponent({
  name: 'AppProjectBody',
  components: { Button, FadeTransition },
  setup(_, { root }) {
    const showBanner = ref(false)
    const steps = computed(() => {
      // TODO: SET TYPE AND VUEX!
      const vuexState = {} as any

      const setActiveDisabledSelectAndDone = (index: 1 | 2 | 3) => {
        return {
          active: root.$route.query.step === `${index}`,
          done: vuexState.progress.done.includes(index),
          disabled:
            !vuexState.progress.done.includes(index) &&
            root.$route.query.step !== `${index}`,
          select: () => root.$store.commit('project/EDITING', index),
        }
      }

      return [
        {
          title: 'Create test',
          icon: 'CirclePlusMinor',
          ...setActiveDisabledSelectAndDone(1),
        },
        {
          title: 'Recruit',
          icon: 'CustomerPlusMajor',
          ...setActiveDisabledSelectAndDone(2),
        },
        {
          title: 'View Results',
          icon: 'CirclePlusMinor',
          ...setActiveDisabledSelectAndDone(3),
        },
      ] as Step[]
    })

    return { steps, showBanner }
  },
})
</script>

<template>
  <div class="isolate">
    <div class="app-page-header !h-56 !relative !z-1 !justify-center">
      <div>
        <div class="flex h-full mx-auto w-fit">
          <template v-for="step in steps">
            <Button
              :key="step.title"
              :disabled="step.disabled"
              plain
              tabindex="-1"
              class="px-20 h-full m-0 !no-underline"
              :class="{
                'pointer-events-none': !step.done,
                'text-text-default': step.done,
              }"
              @click="step.select"
            >
              <div class="flex items-center">
                <PIcon
                  :source="step.icon"
                  class="mr-20 fill-icon"
                  :class="{ 'text-icon-default': step.done }"
                />
                {{ step.title }}
              </div>
            </Button>

            <hr :key="`${step.title}-hr`" class="divider" />
          </template>
        </div>
      </div>
    </div>

    <FadeTransition>
      <div
        v-if="showBanner"
        class="bg-[#202123] shadow-3 h-56 px-32 flex items-center justify-between"
        :style="{ '--fade-transition-duration': '150ms' }"
      >
        <p class="text-surface-default mr-16">
          Making any update to this test will cancel your sharable link and
          delete all your responses
        </p>

        <div class="flex items-center space-x-6">
          <Button primary class="border-0"> Duplicate test </Button>

          <Button
            destructive
            class="border border-interactive-critical after:ring-interactive-critical focus:after:ring-[0.2rem] !shadow-none"
            @click="showBanner = false"
          >
            Continue
          </Button>
        </div>
      </div>
    </FadeTransition>

    <slot />
  </div>
</template>
