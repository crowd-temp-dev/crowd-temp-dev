<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api'
import FollowUpQuestion from '../FollowUpQuestion/index.vue'
import { freshQuestion, sleep, uid, uuidv4 } from '~/utils'
import { LikeNumber } from '~/types'
import { TestSuiteCreateSectionItem } from '~/store/projectSuite/create/section'

type Task = TestSuiteCreateSectionItem['tasks'][0]

export default defineComponent({
  name: 'AppCreateTestStepsTasks',
  components: { FollowUpQuestion },
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
      type: Array as () => Task[],
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

    const verticalDivide =
      'fill-before before:!w-1 before:!left-10 before:bg-border-disabled relative'
    const horizontalDivide =
      'fill-after after:!h-1 after:!w-20 after:!left-10 after:bg-border-disabled'

    const taskAdded = ref(false)

    const modelSync = computed({
      get() {
        return _props.modelValue
      },
      set(val: Task[]) {
        emit('update:modelValue', val)
      },
    })

    const getPreviousFollowUpQuestionLength = (limit: number = undefined) => {
      return modelSync.value
        .slice(0, limit)
        .map((x) => x.followUpQuestions)
        .flat().length
    }

    const addNewTask = async () => {
      modelSync.value = [
        ...modelSync.value,
        {
          title: '',
          id: uuidv4(),
          followUpQuestions: [freshQuestion()],
        },
      ] as Task[]

      await sleep()

      taskAdded.value = true

      requestAnimationFrame(() => {
        const newInput = document.querySelector(
          `#${id.value}-${modelSync.value.length - 1}-task`
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

    return {
      verticalDivide,
      horizontalDivide,
      id,
      modelSync,
      getPreviousFollowUpQuestionLength,
      addNewTask,
    }
  },
})
</script>

<template>
  <div>
    <div v-for="(task, i) in modelSync" :id="task.id" :key="i">
      <h3 class="font-semibold text-heading mb-20">Tasks</h3>

      <div>
        <TextField
          v-model="task.title"
          placeholder="What task would you like people to complete on this prototype?"
          :label="`Task ${i + 1}`"
          required
          v-bind="idAndError(`${id}-${i}-task`)"
        />
      </div>

      <FollowUpQuestion
        v-model="task.followUpQuestions"
        :question-id="questionId"
        :root-number="rootNumber"
        :id-and-error="idAndError"
        :previous-follow-up-question-length="
          i === 0 ? 0 : getPreviousFollowUpQuestionLength(i)
        "
        :total-follow-up-questions-length="getPreviousFollowUpQuestionLength()"
        has-task
      />

      <div v-if="i === modelSync.length - 1" class="mt-20 flex justify-end">
        <Tooltip
          v-slot="{ events }"
          label="Max tasks added!"
          open-delay="16"
          :disabled="!(modelSync.length > 9)"
        >
          <span v-on="events">
            <Button
              primary
              :disabled="modelSync.length > 9"
              @click="addNewTask"
            >
              Add new task
            </Button>
          </span>
        </Tooltip>
      </div>

      <div v-else class="mb-20"></div>
    </div>
  </div>
</template>
