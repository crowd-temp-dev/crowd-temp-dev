<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api'
import QuestionSection from '../QuestionSection/index.vue'
import Question from '../Question/index.vue'
import PreviewURL from '../../CreateProject/PreviewURL/index.vue'
import viewResultProjectType from '~/mixins/view-result-project-type'
import { RootState } from '~/store'

export default defineComponent({
  name: 'AppProjectResultWebsiteEvaluation',
  components: { Question, QuestionSection, PreviewURL },
  mixins: [viewResultProjectType],
  setup(_props, { root }) {
    const props = computed(() => _props as Record<string, any>)

    const sectionTitle = computed(() => {
      return `${props.value.numbering}. Website Evaluation`
    })

    const currentQuestion = computed(() => {
      return (root.$store.state as RootState).projectSuite.viewResult.questions[
        `question-${props.value.numbering}`
      ]
    })

    return { currentQuestion, sectionTitle }
  },
})
</script>

<template>
  <QuestionSection :title="sectionTitle">
    <template #header-action>
      <PreviewURL :preview-src="currentQuestion.websiteLink" plain />
    </template>

    <p :class="{ 'text-text-subdued': !currentQuestion.task }">
      {{ currentQuestion.task || 'No task given' }}
    </p>

    <Question
      v-for="(question, index) in followUpQuestions"
      :key="index"
      :numbering="`${numbering}${getAlphabets(index)}`"
    />
  </QuestionSection>
</template>
