<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api'
import { QuestionModelValue } from '../type'
import Id from '~/components/Base/Id/index.vue'
import { getAlphabetIndex, getAlphabets } from '~/utils'
import { TestSuiteState } from '~/store/projectSuite'

interface ActionOption {
  value: QuestionModelValue['conditionals']['action']
  label: string
}

export default defineComponent({
  name: 'AppProjectFollowUpQuestionsQuestionConditionalLogic',
  components: { Id },
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  props: {
    modelValue: {
      type: Object as () => QuestionModelValue['conditionals'],
      required: true,
    },
    actionOptions: {
      type: Array as () => ActionOption[],
      required: true,
    },
    questionId: {
      type: String,
      required: true,
    },
    followUpQuestionId: {
      type: String,
      required: true,
    },
  },
  setup(_props, { emit, root: { $store } }) {
    const modelSync = computed({
      get() {
        return _props.modelValue
      },
      set(val: QuestionModelValue['conditionals']) {
        emit('update:modelValue', val)
      },
    })

    const actionName = computed(() => modelSync.value.action)

    const state = computed(() => {
      return ($store.state.projectSuite as TestSuiteState).create.section.items
    })

    const question = computed(() =>
      state.value.find((x) => x.id === _props.questionId)
    )

    const questionIndex = computed(() => {
      return state.value.indexOf(question.value)
    })

    const followUpQuestions = computed(() => {
      return question.value.tasks
        ? question.value.tasks[questionIndex.value].followUpQuestions
        : question.value.followUpQuestions
    })

    const questions = computed(() => {
      if (!question.value) {
        return []
      }

      const qIndex = questionIndex.value + 1

      if (!qIndex) {
        return []
      }

      const followUpQuestionIndex = followUpQuestions.value?.findIndex(
        (x) => x.id === _props.followUpQuestionId
      )

      return followUpQuestions.value
        ?.map((_, index) => {
          if (modelSync.value.action === 'goto') {
            if (index <= followUpQuestionIndex + 1) {
              return null
            }
          } else if (index >= followUpQuestionIndex) {
            return null
          }

          const alphabet = getAlphabets(index)

          return {
            label: `Question ${qIndex}${alphabet}`,
            value: `${qIndex}${alphabet}`,
          }
        })
        .filter(Boolean)
    })

    const questionOptions = computed(() => {
      if (!modelSync.value.question) {
        return null
      }

      const qAlphabetIndex = getAlphabetIndex(
        modelSync.value.question.split('')[1]
      )

      const currentQuestion = followUpQuestions.value[qAlphabetIndex]

      if (!currentQuestion) {
        return null
      }

      if (/short-text|long-text/.test(currentQuestion.type)) {
        return null
      }

      if (currentQuestion.type === 'linear-scale') {
        const linearScale = currentQuestion.linearScale

        if (!linearScale) {
          return []
        }

        const startValue = Number(linearScale.start.value)
        const endValue = Number(linearScale.end.value)

        return Array.from(
          {
            length: endValue + 1 - startValue,
          },
          (_, i) => `${i + startValue}`
        ).map((value) => ({
          value,
          label: value,
        }))
      }

      if (!currentQuestion.choices) {
        return []
      }

      return currentQuestion.choices.options
        .map((choice) => {
          return {
            value: choice,
            label: choice,
          }
        })
        .filter((x) => !!x.value)
        .filter(
          (val, index, arr) =>
            arr.findIndex((x) => x.label === val.label) === index
        )
    })

    return { modelSync, actionName, questions, questionOptions }
  },
})
</script>

<template>
  <div
    class="bg-[#EFF3FA] rounded-[3px] px-16 py-4 flex mt-12 items-center space-x-10"
  >
    <Select
      v-model="modelSync.action"
      :options="actionOptions"
      class="shrink-0 min-w-[108px]"
      mandatory
      required
    />

    <Select
      :key="(questions[0] || {}).value"
      v-model="modelSync.question"
      :label="actionName === 'show' ? 'This question if' : undefined"
      bold-label
      :options="questions"
      class="shrink-0 min-w-[124px]"
      mandatory
      :value="(questions[0] || {}).value"
      required
    />

    <Select
      v-if="questionOptions"
      v-model="modelSync.questionAnswer"
      label="If answer is"
      bold-label
      :options="questionOptions"
      class="flex-grow shrink-0"
      content-class="min-w-[110px]"
      :disabled="!modelSync.question || questionOptions.length < 2"
      required
      :placeholder="
        !questionOptions.length
          ? 'No option found'
          : questionOptions.length < 2
          ? 'Add another option'
          : 'Choose a value'
      "
    />

    <Id v-else v-slot="{ id }">
      <div class="flex items-center space-x-8 flex-grow shrink-0">
        <label
          :for="id"
          class="font-semibold text-text-subdued text-sub-heading uppercase shrink-0"
        >
          Answer is
        </label>

        <TextField
          :id="id"
          v-model="modelSync.questionAnswer"
          :options="[{ label: 'value', value: 'Value' }]"
          class="flex-grow shrink-0"
          required
          :disabled="!modelSync.question"
          placeholder="Enter a value"
        />
      </div>
    </Id>
  </div>
</template>
