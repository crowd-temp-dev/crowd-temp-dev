<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api'
import { Layout } from '~/types'
import { dynamicPageTransition } from '~/utils/pageTransition'
import Button from '~/components/Base/Button/index.vue'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'
import { CreateTestState } from '~/store/create-test/create-test'
import { createTestWarningDuplicateId } from '~/utils'
import Warning from '~/components/App/CreateTest/Warning/index.vue'

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
  components: { Button, FadeTransition, Warning },
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

      const routeName = root.$route.name

      const testState = root.$store.state['create-test'] as CreateTestState

      const testId = testState.details.id

      const createTestRouteName = 'create-test-:id'

      const recruitRouteName = 'create-test-recruit-:id'

      const viewResultRouteName = 'create-test-view-result-:id'

      const testCreated = 'published' in testState.details

      const testPublished = testState.details.published

      return [
        {
          title: 'Create test',
          icon: 'CirclePlusMinor',
          active: routeName === createTestRouteName,
          done: /^\/create-test\/(?:recruit|view-result)\/?/.test(routePath),
          select: () => root.$router.push(`/create-test/${testId}/`),
        },
        {
          title: 'Recruit',
          icon: 'CustomerPlusMajor',
          active: routeName === recruitRouteName,
          done: /^\/create-test\/view-result\/?/.test(routePath) || testCreated,
          disabled: routeName === createTestRouteName,
          select: () => root.$router.push(`/create-test/recruit/${testId}`),
        },
        {
          title: 'View Results',
          icon: 'NoteMajor',
          active: routeName === viewResultRouteName,
          done: testPublished,
          disabled: [createTestRouteName, recruitRouteName].includes(routeName),
          select: () => root.$router.push(`/create-test/view-result/${testId}`),
        },
      ] as Step[]
    })

    const showWarning = computed(() => {
      return (
        root.$route.name === 'create-test-:id' &&
        (root.$store.state['create-test'] as CreateTestState).showWarning
      )
    })

    return { steps, showBanner, showWarning, createTestWarningDuplicateId }
  },

  head: {
    title: 'Create test',
  },
})
</script>

<template>
  <div class="min-h-[calc(100%-76px)]">
    <!-- <header> -->
    <div class="app-page-header !h-56 !relative !z-2 !justify-center">
      <div>
        <div class="flex h-full mx-auto w-fit">
          <template v-for="(step, i) in steps">
            <Button
              :key="step.title"
              :disabled="step.disabled && !step.done"
              plain
              tabindex="-1"
              class="px-35 h-full m-0 !no-underline"
              :class="{
                'pointer-events-none': !step.done || step.active,
                'text-text-default': step.done && !step.active,
              }"
              @click="step.select"
            >
              <div class="flex items-center">
                <PIcon
                  :source="step.icon"
                  class="mr-20 fill-icon"
                  :class="{ 'text-icon-default': step.done && !step.active }"
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

    <Warning />

    <FadeTransition>
      <div
        :key="$store.state['create-test'].details.id"
        class="isolate max-w-app mx-auto px-32 lg:px-0 min-h-[calc(100%-56px)]"
      >
        <NuxtChild />
      </div>
    </FadeTransition>
  </div>
</template>
