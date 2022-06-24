<template>
  <div class="px-32">
    <!-- <header> -->
    <div class="app-page-header !h-56 !relative !z-1 !justify-center">
      <div>
        <div class="flex h-full mx-auto w-fit">
          <template v-for="(step, i) in steps">
            <Button
              :key="step.title"
              :disabled="step.disabled"
              plain
              tabindex="-1"
              class="px-35 h-full m-0 !no-underline"
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

            <hr
              v-if="i !== steps.length - 1"
              :key="`${step.title}-hr`"
              class="border-r border-divider h-full opacity-50"
            />
          </template>
        </div>
      </div>
    </div>
    <!-- </header> -->

    <!-- <banner> -->
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
    <!-- </banner -->

    <FadeTransition>
      <div :key="$store.state['create-test'].details.id" class="isolate max-w-app mx-auto">
        <NuxtChild />
      </div>
    </FadeTransition>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api'
import { Layout } from '~/types'
import { dynamicPageTransition } from '~/utils/pageTransition'
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
  name: 'AppBillingPage',
  components: { Button, FadeTransition },
  layout: 'app' as Layout,
  transition: (to, from) =>
    dynamicPageTransition({
      to,
      from,
    }),
  setup(_, { root }) {
    const showBanner = ref(false)

    const steps = computed(() => {
      const routePath = root.$route.path

      return [
        {
          title: 'Create test',
          icon: 'CirclePlusMinor',
          active: /^\/create-test\/?/.test(routePath),
          done: /^\/create-test\/(?:recruit|view-results)\/?/.test(routePath),
          select: () => root.$router.push('/create-test/'),
        },
        {
          title: 'Recruit',
          icon: 'CustomerPlusMajor',
          active: /^\/create-test\/recruit\/?/.test(routePath),
          done: /^\/create-test\/view-results\/?/.test(routePath),
          disabled: /^\/create-test\/?$/.test(routePath),
          select: () => root.$router.push('/create-test/recruit'),
        },
        {
          title: 'View Results',
          icon: 'CirclePlusMinor',
          active: /^\/create-test\/view-results\/?/.test(routePath),
          disabled: /^\/create-test(?:\/?|\/recruit)$/.test(routePath),
          select: () => root.$router.push('/create-test/view-results'),
        },
      ] as Step[]
    })

    return { steps, showBanner }
  },

  head: {
    title: 'Create test',
  },
})
</script>
