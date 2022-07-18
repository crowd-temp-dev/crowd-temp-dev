<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api'
import { QuestionModelValue } from '../type'
import Id from '~/components/Base/Id/index.vue'
import { getAlphabets } from '~/utils'
import { TestSuiteState } from '~/store/testSuite'

interface ActionOption {
  value: QuestionModelValue['conditionals']['action']
  label: string
}

export default defineComponent({
  name: 'AppCreateTestFollowUpQuestionsQuestionConditionalLogic',
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

    const questions = computed(() => {
      const state = ($store.state.testSuite as TestSuiteState).create.section
        .items

      const question = state.find((x) => x.id === _props.questionId)

      if (!question) {
        return []
      }

      const questionIndex = state.indexOf(question) + 1

      if (!questionIndex) {
        return []
      }

      const followUpQuestionIndex = question?.followUpQuestions?.findIndex(
        (x) => x.id === _props.followUpQuestionId
      )

      return question?.followUpQuestions
        ?.map((_, index) => {
          if (index <= followUpQuestionIndex + 1) {
            return null
          }

          const alphabet = getAlphabets(index)

          return {
            label: `Question ${questionIndex}${alphabet}`,
            value: `${questionIndex}${alphabet}`,
          }
        })
        .filter(Boolean)
    })

    return { modelSync, actionName, questions }
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
      v-if="actionName === 'goto'"
      v-model="modelSync.questionAnswer"
      label="If answer is"
      bold-label
      :options="[{ label: 'Value', value: 'value' }]"
      class="flex-grow shrink-0"
      content-class="min-w-[110px]"
      required
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
        />
      </div>
    </Id>
  </div>
</template>
