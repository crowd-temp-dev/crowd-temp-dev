<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api'
import SortSteps from '~/components/App/CreateTest/SortSteps/index.vue'
import Steps from '~/components/App/CreateTest/Steps/index.vue'
import {
  scrollMain,
  splitPath,
  layoutSizing,
  createTestWarningDuplicateId,
} from '~/utils'
import { dynamicPageTransition } from '~/utils/pageTransition'
import type { TestIndex } from '~/store/createTest/state'
import { CreateTestState } from '~/store/create-test/create-test'
import eventKey from '~/utils/eventKey'

export default defineComponent({
  name: 'AppCreateTestIndexPage',
  components: { SortSteps, Steps },

  transition: (to, from) => {
    const splitFrom = splitPath(from?.path || '')

    if (splitFrom[0] === 'create-test') {
      return 'page-transition-slide-left'
    }

    return dynamicPageTransition({
      to,
      from,
    })
  },

  setup(_, { root }) {
    const stepsKey = ref(performance.now())

    const showWarning = computed(() => {
      return (root.$store.state['create-test'] as CreateTestState).showWarning
    })

    const stopTabbing = computed(() => {
      if (showWarning.value) {
        return {
          keydown: (evt: KeyboardEvent) => {
            if (eventKey(evt) === 'tab') {
              evt.preventDefault()
            }
          },
          focus: () => {
            const warningDuplicateBtn = document.getElementById(
              createTestWarningDuplicateId
            )

            if (warningDuplicateBtn) {
              warningDuplicateBtn.focus({
                preventScroll: true,
              })
            }
          },
        }
      } else return {}
    })

    const updateStepsKey = (section: TestIndex) => {
      if (section) {
        stepsKey.value = performance.now()

        const nextSection = document.getElementById(section.id)

        if (nextSection) {
          const { appHeader, layoutHeader, layoutPadding } = layoutSizing

          const scrollY =
            nextSection.offsetTop - appHeader - layoutHeader - layoutPadding

          scrollMain(scrollY)
        }
      }
    }

    return { stepsKey, showWarning, stopTabbing, updateStepsKey }
  },

  fetch({ store, route }) {
    store.dispatch('create-test/setId', route.params.id).then(() => {
      store.dispatch('create-test/getCreateTest')
    })
  },
})
</script>

<template>
  <div
    :tabindex="showWarning ? '0' : undefined"
    class="mt-32 max-w-app mx-auto pb-112 min-w-full"
    :class="{ 'pointer-events-none': showWarning }"
    v-on="stopTabbing"
  >
    <div
      :inert="showWarning || undefined"
      class="w-full grid grid-cols-[auto,1fr] grid-flow-col gap-x-32 min-w-full"
    >
      <SortSteps @shuffled="updateStepsKey" />
      <Transition name="fade-transition" mode="out-in">
        <Steps
          :key="stepsKey"
          :style="{
            '--fade-enter-duration': '500ms',
          }"
        />
      </Transition>
    </div>
  </div>
</template>
