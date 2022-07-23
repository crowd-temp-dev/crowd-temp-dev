<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import QuestionSection from '../QuestionSection/index.vue'
import Question from '../Question/index.vue'
import viewResultProjectType from '~/mixins/view-result-project-type'

export default defineComponent({
  name: 'AppProjectResultSimpleSurvey',
  components: { Question, QuestionSection },
  mixins: [viewResultProjectType],
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
