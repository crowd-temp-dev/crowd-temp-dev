<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api'
import { Layout } from '~/types'
import { dynamicPageTransition } from '~/utils/pageTransition'
import Button from '~/components/Base/Button/index.vue'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'
import { createTestWarningDuplicateId } from '~/utils'
import Warning from '~/components/App/CreateTest/Warning/index.vue'
import { RootState } from '~/store'
import LoadingBar, {
  LoadingBarState,
} from '~/components/Base/LoadingBar/index.vue'

type Step = {
  title: 'Create test' | 'Recruit' | 'View Results'
  icon: 'CirclePlusMinor' | 'CustomerPlusMajor'
  active: boolean
  done: boolean
  disabled: Boolean
  to: string
}

export default defineComponent({
  name: 'AppBillingPage',
  components: { Button, FadeTransition, Warning, LoadingBar },
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

      const testState = (root.$store.state as RootState).testSuite

      const testId = testState.detail.id

      const createTestRouteName = 'dashboard-create-test-:id'

      const recruitRouteName = 'dashboard-create-test-recruit-:id'

      const viewResultRouteName = 'dashboard-create-test-view-result-:id'

      const testCreated = testState.detail.created

      const testPublished = testState.detail.published

      return [
        {
          title: 'Create test',
          icon: 'CirclePlusMinor',
          active: routeName === createTestRouteName,
          done: /^\/dashboard\/create-test\/(?:recruit|view-result)\/?/.test(
            routePath
          ),
          to: `/dashboard/create-test/${testId}/`,
        },
        {
          title: 'Recruit',
          icon: 'CustomerPlusMajor',
          active: routeName === recruitRouteName,
          done:
            /^\/dashboard\/create-test\/view-result\/?/.test(routePath) ||
            testCreated,
          disabled: routeName === createTestRouteName,
          to: `/dashboard/create-test/recruit/${testId}`,
        },
        {
          title: 'View Results',
          icon: 'NoteMajor',
          active: routeName === viewResultRouteName,
          done: testPublished,
          disabled: [createTestRouteName, recruitRouteName].includes(routeName),
          to: `/dashboard/create-test/view-result/${testId}`,
        },
      ] as Step[]
    })

    const createTestState = computed(() => {
      return (root.$store.state as RootState).testSuite.create
    })

    const showWarning = computed(() => {
      return (
        root.$route.name === 'dashboard-create-test-:id' &&
        createTestState.value.showWarning
      )
    })

    const progressState = computed<LoadingBarState>(() => {
      const { submitError, submitting } = createTestState.value

      if (submitError) {
        return 'error'
      }

      if (submitting) {
        return 'start'
      }

      return 'finish'
    })

    const onProgressDone = () => {
      root.$store.commit('testSuite/create/setSubmitError', false)
    }

    return {
      steps,
      showBanner,
      createTestState,
      showWarning,
      createTestWarningDuplicateId,
      progressState,
      onProgressDone,
    }
  },

  head: {
    title: 'Create test',
  },
})
</script>

<template>
  <div class="min-h-[calc(100%-76px)] relative">
    <LoadingBar
      :state="progressState"
      class="!left-[auto] !top-[auto] !w-[calc(100%-var(--sidebar-width))]"
      duration="15s"
      throttle="0"
      @on-finish="onProgressDone"
    />

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
              :to="step.to"
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

    <Warning />

    <FadeTransition>
      <div
        :key="$store.state.testSuite.detail.id"
        class="isolate max-w-app mx-auto px-32 lg:px-0 min-h-[calc(100%-56px)] transition-opacity"
        :class="{
          'pointer-events-none opacity-70': createTestState.submitting,
        }"
      >
        <NuxtChild />
      </div>
    </FadeTransition>
  </div>
</template>
