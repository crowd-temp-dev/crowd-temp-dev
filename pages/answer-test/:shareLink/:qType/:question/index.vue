<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import { CreateTestComponent, Layout } from '~/types'
import SimpleSurvey from '~/components/AnswerTest/Template/SimpleSurvey/index.vue'
import DesignSurvey from '~/components/AnswerTest/Template/DesignSurvey/index.vue'
import FiveSecondsTest from '~/components/AnswerTest/Template/FiveSecondsTest/index.vue'
import PreferenceTest from '~/components/AnswerTest/Template/PreferenceTest/index.vue'
import { features } from '~/utils'

export default defineComponent({
  name: 'AnswerTestQuestionPage',
  components: { SimpleSurvey, DesignSurvey, FiveSecondsTest, PreferenceTest },

  layout: 'answer-test' as Layout,
  validate(ctx) {
    const { qType } = ctx.route.params

    return !!Object.values(features).find(
      (x) => x.createTestComponent === qType
    )
  },
  transition: 'answer-page-transition',

  setup(_, { root }) {
    const template = computed(() => {
      return root.$route.params.qType as CreateTestComponent
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
