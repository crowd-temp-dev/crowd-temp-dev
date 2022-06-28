<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import QuestionSection from '../QuestionSection/index.vue'
import Question from '../Question/index.vue'
import viewResultTestType from '~/mixins/view-result-test-type'

export default defineComponent({
  name: 'AppCreateTestResultSimpleSurvey',
  components: { Question, QuestionSection },
  mixins: [viewResultTestType],
})
</script>

<template>
  <QuestionSection :title="`${numbering}. Simple Survey`">
    <Question
      v-for="(question, index) in followUpQuestions"
      :key="index"
      :numbering="`${numbering}${getAlphabets(index)}`"
    />
  </QuestionSection>
</template>
