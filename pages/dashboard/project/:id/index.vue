<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api'
import SortSteps from '~/components/App/CreateProject/SortSteps/index.vue'
import Steps from '~/components/App/CreateProject/Steps/index.vue'
import {
  scrollMain,
  splitPath,
  layoutSizing,
  projectWarningDuplicateId,
} from '~/utils'
import { dynamicPageTransition } from '~/utils/pageTransition'
import eventKey from '~/utils/eventKey'
import { RootState } from '~/store'

export default defineComponent({
  name: 'AppProjectIndexPage',
  components: { SortSteps, Steps },

  transition: (to, from) => {
    const splitFrom = splitPath(from?.path || '')

    if (splitFrom[1] === 'project') {
      return 'page-transition-slide-right'
    }

    return dynamicPageTransition({
      to,
      from,
    })
  },

  setup(_, { root }) {
    const stepsKey = ref(performance.now())

    const showWarning = computed(() => {
      return (root.$store.state as RootState).projectSuite.create.showWarning
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
              projectWarningDuplicateId
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

    // TODO: SET TYPE
    const updateStepsKey = (section: any) => {
      if (section) {
        stepsKey.value = performance.now()

        const nextSection = document.getElementById(section.id)

        if (nextSection) {
          const { layoutPadding } = layoutSizing

          const scrollY = nextSection.offsetTop - layoutPadding

          scrollMain(scrollY)
        }
      }
    }

    return { stepsKey, showWarning, stopTabbing, updateStepsKey }
  },

  fetch({ store, route }) {
    store.dispatch('projectSuite/detail/setId', route.params.id).then(() => {
      store.dispatch('projectSuite/create/fetch')
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
