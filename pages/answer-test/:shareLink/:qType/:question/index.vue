<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import { ProjectComponent, Layout } from '~/types'
import SimpleSurvey from '~/components/AnswerTest/Template/SimpleSurvey/index.vue'
import DesignSurvey from '~/components/AnswerTest/Template/DesignSurvey/index.vue'
import FiveSecondTest from '~/components/AnswerTest/Template/FiveSecondTest/index.vue'
import PreferenceTest from '~/components/AnswerTest/Template/PreferenceTest/index.vue'
import CardSorting from '~/components/AnswerTest/Template/CardSorting/index.vue'
import WebsiteEvaluation from '~/components/AnswerTest/Template/WebsiteEvaluation/index.vue'
import PrototypeEvaluation from '~/components/AnswerTest/Template/PrototypeEvaluation/index.vue'
import CustomMessage from '~/components/AnswerTest/Template/CustomMessage/index.vue'
import { features } from '~/utils'

export default defineComponent({
  name: 'AnswerTestQuestionPage',
  components: {
    SimpleSurvey,
    DesignSurvey,
    FiveSecondTest,
    PreferenceTest,
    CardSorting,
    WebsiteEvaluation,
    PrototypeEvaluation,
    CustomMessage
  },

  layout: 'answer-test' as Layout,
  validate(ctx) {
    const { qType } = ctx.route.params

    return !!Object.values(features).find(
      (x) => x.projectComponent === qType
    )
  },
  transition: 'answer-page-transition',

  setup(_, { root }) {
    const template = computed(() => {
      return root.$route.params.qType as ProjectComponent
    })

    return { template }
  },

  head: {
    title: 'FAUX title!!! Answer tests',
    meta: [
      {
        hid: 'description',
        name: 'descrition',
        content: 'Answer tests. FILL THIS UP',
      },
    ],
  },
})
</script>

<template>
  <Component :is="template" />
</template>
