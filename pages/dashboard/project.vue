<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api'
import { Layout } from '~/types'
import { dynamicPageTransition } from '~/utils/pageTransition'
import Button from '~/components/Base/Button/index.vue'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'
import { projectWarningDuplicateId } from '~/utils'
import Warning from '~/components/App/CreateProject/Warning/index.vue'
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

      const testState = (root.$store.state as RootState).projectSuite

      const testId = testState.detail.id

      const projectRouteName = 'dashboard-project-:id'

      const recruitRouteName = 'dashboard-project-recruit-:id'

      const viewResultRouteName = 'dashboard-project-view-result-'

      const testCreated = testState.detail.created

      const testPublished = testState.detail.published

      return [
        {
          title: 'Create test',
          icon: 'CirclePlusMinor',
          active: routeName === projectRouteName,
          done: /^\/dashboard\/project\/(?:recruit|view-result)\/?/.test(
            routePath
          ),
          to: `/dashboard/project/${testId}/`,
        },
        {
          title: 'Recruit',
          icon: 'CustomerPlusMajor',
          active: routeName === recruitRouteName,
          done:
            /^\/dashboard\/project\/view-result\/?/.test(routePath) ||
            testCreated,
          disabled: routeName === projectRouteName,
          to: `/dashboard/project/recruit/${testId}`,
        },
        {
          title: 'View Results',
          icon: 'NoteMajor',
          active: routeName.startsWith(viewResultRouteName),
          done: testPublished,
          disabled: [projectRouteName, recruitRouteName].includes(routeName),
          to: `/dashboard/project/view-result/responses/${testId}`,
        },
      ] as Step[]
    })

    const projectState = computed(() => {
      return (root.$store.state as RootState).projectSuite.create
    })

    const showWarning = computed(() => {
      return (
        root.$route.name === 'dashboard-project-:id' &&
        projectState.value.showWarning
      )
    })

    const progressState = computed<LoadingBarState>(() => {
      const { submitError, submitting } = projectState.value

      if (submitError) {
        return 'error'
      }

      if (submitting) {
        return 'start'
      }

      return 'finish'
    })

    const onProgressDone = () => {
      root.$store.commit('projectSuite/create/setSubmitError', false)
    }

    return {
      steps,
      showBanner,
      projectState,
      showWarning,
      projectWarningDuplicateId,
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
  <div class="min-h-[calc(100%-64px)] relative">
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
        :key="$store.state.projectSuite.detail.id"
        class="isolate w-full px-32 min-h-[calc(100%-56px)] transition-opacity"
        :class="{
          'pointer-events-none opacity-70': projectState.submitting,
        }"
      >
        <NuxtChild />
      </div>
    </FadeTransition>
  </div>
</template>
