<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api'
import Notes from '@/components/App/CreateTestResult/Notes/index.vue'
import Summary from '@/components/App/CreateTestResult/Summary/index.vue'
import DesignSurvey from '@/components/App/CreateTestResult/DesignSurvey/index.vue'
import SimpleSurvey from '@/components/App/CreateTestResult/SimpleSurvey/index.vue'
import FiveSecondsTest from '@/components/App/CreateTestResult/FiveSecondsTest/index.vue'
import WebsiteEvaluation from '@/components/App/CreateTestResult/WebsiteEvaluation/index.vue'
import PrototypeEvaluation from '@/components/App/CreateTestResult/PrototypeEvaluation/index.vue'
import PreferenceTest from '@/components/App/CreateTestResult/PreferenceTest/index.vue'
import CardSorting from '@/components/App/CreateTestResult/CardSorting/index.vue'

import { dynamicPageTransition } from '~/utils/pageTransition'
import { splitPath } from '~/utils'
import Spinner from '~/components/Base/Spinner/index.vue'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'
import { RootState } from '~/store'

export default defineComponent({
  name: 'AppCreateTestRecruitPage',
  components: {
    Notes,
    Summary,
    Spinner,
    FadeTransition,
    DesignSurvey,
    SimpleSurvey,
    FiveSecondsTest,
    WebsiteEvaluation,
    PrototypeEvaluation,
    PreferenceTest,
    CardSorting,
  },

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
    const result = computed(
      () => (root.$store.state as RootState).testSuite.viewResult
    )

    const fetchingResult = computed(() => {
      return result.value.loading && root.$route.params.id !== result.value.id
    })

    const resultAnswers = computed(() => {
      // get all question-\d from result.questions

      if (fetchingResult.value) {
        return []
      }

      return Object.entries(result.value.questions)
        .filter(([key]) => /^question-\d+$/.test(key))
        .map(([key, value]) => {
          return {
            index: Number(key.replace(/^question-/, '')),
            type: value.type,
          }
        })
    })

    root.$store
      .dispatch('testSuite/detail/setId', root.$route.params.id)
      .then(() => {
        root.$store.dispatch('testSuite/viewResult/fetch')
      })

    return { result, fetchingResult, resultAnswers }
  },
})
</script>

<template>
  <FadeTransition>
    <div
      :key="`loading-${fetchingResult}`"
      class="grid grid-cols-[1fr,auto] grid-flow-col gap-x-32 max-w-app mx-auto min-w-full h-full"
      :class="{ 'pb-112 mt-32': !fetchingResult }"
    >
      <div
        v-if="fetchingResult"
        class="w-full flex-centered h-[calc(100vh-56px-76px-56px)]"
      >
        <Spinner class="text-[36px] text-text-subdued" />
      </div>

      <template v-else>
        <div class="min-w-[min(100%,800px)] grid gap-y-32">
          <Summary
            :participants="result.answers.length"
            :responses="result.responses"
            :share-link="result.testDetails.shareLink"
          />

          <Component
            :is="answer.type"
            v-for="answer in resultAnswers"
            :key="answer.index"
            :numbering="answer.index"
          />
        </div>

        <Notes />
      </template>
    </div>
  </FadeTransition>
</template>
