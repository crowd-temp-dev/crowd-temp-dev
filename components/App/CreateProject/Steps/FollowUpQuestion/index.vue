<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api'
import Question from './Question/index.vue'
import { QuestionModelValue } from './Question/type'
import Button from '~/components/Base/Button/index.vue'
import SmoothDrag from '~/components/Base/SmoothDrag/index.vue'
import { freshQuestion, sleep, uid, getAlphabets, uuidv4 } from '~/utils'
import { LikeNumber } from '~/types'
import DynamicTag from '~/components/Base/DynamicTag/index.vue'

export default defineComponent({
  name: 'AppCreateTestStepsFollowUpQuestion',
  components: { Question, Button, SmoothDrag, DynamicTag },
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
    hasTask: Boolean,
    previousFollowUpQuestionLength: {
      type: Number,
      default: 0,
    },
    totalFollowUpQuestionsLength: {
      type: Number,
      default: 0,
    },
  },
  setup(_props, { emit }) {
    const id = ref(uid())

    const props = computed(() => _props)

    let verticalDivide: string
    let horizontalDivide: string

    if (props.value.hasTask) {
      verticalDivide =
        'fill-before before:!w-1 before:!left-12 before:bg-border-disabled relative'

      horizontalDivide =
        'fill-after after:!h-1 after:!w-20 after:!left-12 after:bg-border-disabled'
    }

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
      verticalDivide,
      horizontalDivide,
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
      v-if="!hasTask"
      class="w-[88%] mb-20"
      :class="{ 'mt-20': !hideTitle }"
    />

    <DynamicTag
      v-if="!hideTitle"
      :tag="hasTask ? 'h4' : 'h3'"
      class="text-[16px] leading-[20px] pb-20"
      :class="{
        'font-semibold': !hasTask,
        [`font-medium pl-42 pt-20 ${verticalDivide}`]: hasTask,
      }"
    >
      {{ title }}
    </DynamicTag>

    <template v-if="modelSync.length">
      <SmoothDrag
        v-slot="{ drag }"
        v-model="modelSync"
        group-tag="ol"
        :group-class="`grid${hasTask ? '' : ' gap-y-42'}`"
        :disabled="modelSync.length < 2"
      >
        <Question
          v-for="(question, i) in modelSync"
          :id="`${id}-${i}`"
          :key="question.id"
          v-model="modelSync[i]"
          :question-index="i"
          :question-length="modelSync.length"
          :question-id="questionId"
          :data-id="question.id"
          :question-title="`Question ${rootNumber}${getAlphabets(
            i + previousFollowUpQuestionLength
          )}`"
          :appear="questionAdded"
          :disable-drag="modelSync.length < 2"
          :disable-delete="modelSync.length <= Number(minLength)"
          :min-length="minLength"
          :id-and-error="idAndError"
          :class="[
            hasTask
              ? [
                  'pl-42',
                  {
                    'pt-42': !!i,
                    [`${verticalDivide} ${horizontalDivide}${
                      i >= modelSync.length - 1
                        ? modelSync.length === 1
                          ? ' before:!h-42 after:!top-42'
                          : ' before:!h-84 after:!top-84'
                        : i === 0
                        ? ' after:!top-42'
                        : ' after:!top-84'
                    }`]: !drag,
                  },
                ]
              : '',
          ]"
          @on-delete="removeQuestion(i)"
          @on-duplicate="duplicate(i)"
          @dragstart="
            (evt) => {
              evt.target.classList.add('before:invisible', 'after:invisible')
            }
          "
        />
      </SmoothDrag>

      <PHorizontalDivider v-if="!hasTask" class="mt-32" />
    </template>

    <p
      v-else
      class="ml-30 text-border-critical-default font-semibold grid grid-flow-col items-center justify-start"
    >
      <PIcon source="AlertMinor" class="fill-icon mr-8" />
      No follow up question
    </p>

    <div
      class="flex justify-end mt-20"
      :class="{
        'mt-20': !hasTask,
        'mt-24': hasTask,
      }"
    >
      <Tooltip
        v-slot="{ events }"
        label="Max questions added!"
        open-delay="16"
        :disabled="
          !(modelSync.length >= 26 || totalFollowUpQuestionsLength >= 26)
        "
      >
        <span v-on="events">
          <Button
            :primary="!hasTask"
            :disabled="
              modelSync.length >= 26 || totalFollowUpQuestionsLength >= 26
            "
            @click="addQuestion"
          >
            Add new question
          </Button>
        </span>
      </Tooltip>
    </div>

    <PHorizontalDivider v-if="hasTask" class="mt-32" />
  </div>
</template>
