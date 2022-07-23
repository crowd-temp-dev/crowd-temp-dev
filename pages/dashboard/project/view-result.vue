<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api'
import Notes from '@/components/App/CreateProjectResult/Notes/index.vue'
import Summary from '@/components/App/CreateProjectResult/Summary/index.vue'
import { dynamicPageTransition } from '~/utils/pageTransition'
import { splitPath } from '~/utils'
import Spinner from '~/components/Base/Spinner/index.vue'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'
import { RootState } from '~/store'
import TabSwitcher from '~/components/App/CreateProjectResult/TabSwitcher/index.vue'

export default defineComponent({
  name: 'AppProjectRecruitPage',
  components: {
    Notes,
    Summary,
    Spinner,
    FadeTransition,
    TabSwitcher,
  },

  transition: (to, from) => {
    const splitFrom = splitPath(from?.path || '')

    if (splitFrom[1] === 'project') {
      return 'page-transition-slide-left'
    }

    return dynamicPageTransition({
      to,
      from,
    })
  },

  setup(_, { root }) {
    const result = computed(
      () => (root.$store.state as RootState).projectSuite.viewResult
    )

    const fetchingResult = computed(() => {
      return result.value.loading && root.$route.params.id !== result.value.id
    })

    root.$store
      .dispatch('projectSuite/detail/setId', root.$route.params.id)
      .then(() => {
        root.$store.dispatch('projectSuite/viewResult/fetch')
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
