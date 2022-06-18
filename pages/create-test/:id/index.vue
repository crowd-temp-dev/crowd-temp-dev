<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import SortSteps from '~/components/App/CreateTest/SortSteps/index.vue'
import Steps from '~/components/App/CreateTest/Steps/index.vue'
import { scrollMain, splitPath, layoutSizing } from '~/utils'
import { dynamicPageTransition } from '~/utils/pageTransition'
import type { TestIndex } from '~/store/createTest/state'

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

  setup() {
    const stepsKey = ref(performance.now())

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

    return { stepsKey, updateStepsKey }
  },

  fetch({ store, route }) {    
    store.dispatch('create-test/setId', route.params.id).then(() => {
      store.dispatch('create-test/getCreateTest')
    })
  },
})
</script>

<template>
  <div class="mt-32 max-w-app mx-auto pb-112 min-w-full">
    <div
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
