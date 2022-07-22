<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api'
import Notes from '@/components/App/CreateTestResult/Notes/index.vue'
import Summary from '@/components/App/CreateTestResult/Summary/index.vue'
import { dynamicPageTransition } from '~/utils/pageTransition'
import { splitPath } from '~/utils'
import Spinner from '~/components/Base/Spinner/index.vue'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'
import { RootState } from '~/store'
import TabSwitcher from '~/components/App/CreateTestResult/TabSwitcher/index.vue'

export default defineComponent({
  name: 'AppCreateTestRecruitPage',
  components: {
    Notes,
    Summary,
    Spinner,
    FadeTransition,
    TabSwitcher,
  },

  transition: (to, from) => {
    const splitFrom = splitPath(from?.path || '')

    if (splitFrom[1] === 'create-test') {
      return 'page-transition-slide-left'
    }

    return dynamicPageTransition({
      to,
      from,
    })
  },

  setup(_, { root }) {
    const result = computed(
      () => (root.$store.state as RootState).testSuite.viewResult
    )

    const fetchingResult = computed(() => {
      return result.value.loading && root.$route.params.id !== result.value.id
    })

    root.$store
      .dispatch('testSuite/detail/setId', root.$route.params.id)
      .then(() => {
        root.$store.dispatch('testSuite/viewResult/fetch')
      })

    return { result, fetchingResult }
  },

  head: {
    title: 'View results',
  },
})
</script>

<template>
  <FadeTransition>
    <div
      :key="`loading-${fetchingResult}`"
      class="grid grid-cols-[1fr,auto] grid-flow-col gap-x-32 max-w-app mx-auto h-full"
      :class="{ 'pb-112 mt-32': !fetchingResult }"
    >
      <div
        v-if="fetchingResult"
        class="w-full flex-centered h-[calc(100vh-56px-64px-56px)]"
      >
        <Spinner class="text-[36px] text-text-subdued" />
      </div>

      <template v-else>
        <div class="min-w-[min(100%,800px)] grid">
          <Summary
            :participants="result.answers.length"
            :responses="result.responses"
            :share-link="result.testDetails.shareLink"
          />

          <TabSwitcher />

          <div class="pt-16">
            <NuxtChild />
          </div>
        </div>

        <Notes />
      </template>
    </div>
  </FadeTransition>
</template>
