<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api'
import Question from './Question/index.vue'
import { QuestionModelValue } from './Question/type'
import Button from '~/components/Base/Button/index.vue'
import SmoothDrag from '~/components/Base/SmoothDrag/index.vue'
import { freshQuestion, sleep, uid, getAlphabets, uuidv4 } from '~/utils'
import { LikeNumber } from '~/types'

export default defineComponent({
  name: 'AppCreateTestStepsFollowUpQuestion',
  components: { Question, Button, SmoothDrag },
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  props: {
    hideTitle: Boolean,
    title: {
      type: String,
      default: 'Follow-up questions',
    },
    rootNumber: {
      type: Number,
      required: true,
    },
    modelValue: {
      type: Array as () => QuestionModelValue[],
      required: true,
    },
    questionId: {
      type: String,
      required: true,
    },
    minLength: {
      type: [String, Number] as unknown as () => LikeNumber,
      default: 1,
    },
    idAndError: {
      type: Function,
      required: true,
    },
  },
  setup(_props, { emit }) {
    const id = ref(uid())

    const modelSync = computed({
      get() {
        return _props.modelValue
      },
      set(val: QuestionModelValue[]) {
        emit('update:modelValue', val)
      },
    })

    const questionAdded = ref(false)

    const addQuestion = async () => {
      modelSync.value = [
        ...modelSync.value,
        freshQuestion() as unknown as QuestionModelValue,
      ]

      await sleep()

      questionAdded.value = true

      requestAnimationFrame(() => {
        const newInput = document.querySelector(
          `#${id.value}-${modelSync.value.length - 1}-title`
        ) as HTMLInputElement

        if (newInput) {
          newInput.focus()

          newInput.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
        }
      })
    }

    const duplicate = async (index: number) => {
      modelSync.value = [
        ...modelSync.value.slice(0, index),
        {
          ...modelSync.value[index],
          id: uuidv4(),
        },
        ...modelSync.value.slice(index),
      ] as QuestionModelValue[]

      await sleep()

      questionAdded.value = true

      requestAnimationFrame(() => {
        const newInput = document.querySelector(
          `#${id.value}-${index + 1}-title`
        ) as HTMLInputElement

        if (newInput) {
          newInput.focus()

          newInput.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
        }
      })
    }

    const removeQuestion = (index: number) => {
      modelSync.value = modelSync.value.filter((_, i) => i !== index)
    }

    return {
      id,
      modelSync,
      questionAdded,
      getAlphabets,
      addQuestion,
      removeQuestion,
      duplicate,
    }
  },
})
</script>

<template>
  <div>
    <PHorizontalDivider
      class="w-[88%] mb-20"
      :class="{ 'mt-20': !hideTitle }"
    />

    <h3
      v-if="!hideTitle"
      class="font-semibold text-[16px] leading-[20px] mb-20"
    >
      {{ title }}
    </h3>
    <template v-if="modelSync.length">
      <SmoothDrag
        v-model="modelSync"
        group-tag="ol"
        group-class="grid gap-y-42"
        :disabled="modelSync.length < 2"
      >
        <Question
          v-for="(question, i) in modelSync"
          :id="`${id}-${i}`"
          :key="question.id"
          v-model="modelSync[i]"
          :question-id="questionId"
          :data-id="question.id"
          :question-title="`Question ${rootNumber}${getAlphabets(i)}`"
          :appear="questionAdded"
          :disable-drag="modelSync.length < 2"
          :disable-delete="modelSync.length <= Number(minLength)"
          :min-length="minLength"
          :id-and-error="idAndError"
          @on-delete="removeQuestion(i)"
          @on-duplicate="duplicate(i)"
        />
      </SmoothDrag>

      <PHorizontalDivider class="mt-32" />
    </template>

    <p
      v-else
      class="ml-30 text-border-critical-default font-semibold grid grid-flow-col items-center justify-start"
    >
      <PIcon source="AlertMinor" class="fill-icon mr-8" />
      No follow up question
    </p>

    <div class="flex justify-end mt-20">
      <Button primary :disabled="modelSync.length >= 50" @click="addQuestion">
        Add new question
      </Button>
    </div>
  </div>
</template>
