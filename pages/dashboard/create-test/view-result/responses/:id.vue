<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import DesignSurvey from '@/components/App/CreateTestResult/DesignSurvey/index.vue'
import SimpleSurvey from '@/components/App/CreateTestResult/SimpleSurvey/index.vue'
import FiveSecondTest from '@/components/App/CreateTestResult/FiveSecondTest/index.vue'
import WebsiteEvaluation from '@/components/App/CreateTestResult/WebsiteEvaluation/index.vue'
import PrototypeEvaluation from '@/components/App/CreateTestResult/PrototypeEvaluation/index.vue'
import PreferenceTest from '@/components/App/CreateTestResult/PreferenceTest/index.vue'
import CardSorting from '@/components/App/CreateTestResult/CardSorting/index.vue'
import { RootState } from '~/store'
import { splitPath } from '~/utils'
import { dynamicPageTransition } from '~/utils/pageTransition'

export default defineComponent({
  name: 'AppCreateTestViewResultUserSessionsPage',
  components: {
    DesignSurvey,
    SimpleSurvey,
    FiveSecondTest,
    WebsiteEvaluation,
    PrototypeEvaluation,
    PreferenceTest,
    CardSorting,
  },

  transition: (to, from) => {
    const splitFrom = splitPath(from?.path || '')

    if (splitFrom[2] === 'view-result') {
      return 'page-transition-slide-right'
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

    return { resultAnswers }
  },

  fetch() {},

  head: {
    title: 'Test results responses',
  },
})
</script>

<template>
  <div>
    <Component
      :is="answer.type"
      v-for="answer in resultAnswers"
      :key="answer.index"
      :numbering="answer.index"
    />
  </div>
</template>
