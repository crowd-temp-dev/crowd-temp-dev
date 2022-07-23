<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api'
import QuestionSection from '../QuestionSection/index.vue'
import Question from '../Question/index.vue'
import PreviewURL from '../../CreateProject/PreviewURL/index.vue'
import viewResultTestType from '~/mixins/view-result-test-type'
import { routeQuery } from '~/server-middleware/utils'
import { RootState } from '~/store'

export default defineComponent({
  name: 'AppProjectResultPrototypeEvaluation',
  components: { Question, QuestionSection, PreviewURL },
  mixins: [viewResultTestType],
  setup(_props, { root }) {
    const props = computed(() => _props as Record<string, any>)

    const sectionTitle = computed(() => {
      return `${props.value.numbering}. Prototype Evaluation`
    })

    const currentQuestion = computed(() => {
      return (root.$store.state as RootState).projectSuite.viewResult.questions[
        `question-${props.value.numbering}`
      ]
    })

    const prototypeLink = computed(() => {
      switch (currentQuestion.value.prototypeProvider) {
        case 'figma':
          return `https://www.figma.com/embed?${routeQuery({
            embed_host: 'share',
            url: `https://${(currentQuestion.value.prototypeLink || '').replace(
              /^https?:\/\//,
              ''
            )}`,
          })}`
        default:
          return ''
      }
    })

    return { currentQuestion, sectionTitle, prototypeLink }
  },
})
</script>

<template>
  <QuestionSection :title="sectionTitle">
    <template #header-action>
      <PreviewURL :preview-src="prototypeLink" plain />
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
