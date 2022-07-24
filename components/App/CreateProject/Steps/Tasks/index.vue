<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api'
import FollowUpQuestion from '../FollowUpQuestion/index.vue'
import { freshQuestion, sleep, uid, uuidv4 } from '~/utils'
import { LikeNumber } from '~/types'
import { TestSuiteCreateSectionItem } from '~/store/projectSuite/create/section'
import SmoothDrag from '~/components/Base/SmoothDrag/index.vue'

type Task = TestSuiteCreateSectionItem['tasks'][0]

export default defineComponent({
  name: 'AppCreateTestStepsTasks',
  components: { FollowUpQuestion, SmoothDrag },
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
    taskPlaceholder: {
      type: String,
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

    const disableDrag = computed(() => {
      return modelSync.value.length < 2
    })

    const disableDuplicate = computed(() => {
      return (
        modelSync.value.length > 9 || getPreviousFollowUpQuestionLength() > 25
      )
    })

    const maxTasks = computed(() => modelSync.value.length > 9)

    const getPreviousFollowUpQuestionLength = (limit: number = undefined) => {
      return modelSync.value
        .slice(0, limit)
        .map((x) => x.followUpQuestions)
        .flat().length
    }

    const addNewTask = async () => {
      if (maxTasks.value) {
        return
      }

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

    const duplicateTask = async (index: number) => {
      if (disableDuplicate.value) {
        return
      }

      modelSync.value = [
        ...modelSync.value.slice(0, index),
        {
          ...modelSync.value[index],
          followUpQuestions: modelSync.value[index].followUpQuestions.map(
            (x) => ({
              ...x,
              id: uuidv4(),
            })
          ),
          id: uuidv4(),
        },
        ...modelSync.value.slice(index),
      ]

      await sleep()

      taskAdded.value = true

      requestAnimationFrame(() => {
        const newInput = document.querySelector(
          `#${id.value}-${index + 1}-task`
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

    const deleteTask = (index: number) => {
      if (disableDrag.value) {
        return
      }

      modelSync.value = modelSync.value.filter((_, i) => i !== index)
    }

    return {
      verticalDivide,
      horizontalDivide,
      id,
      modelSync,
      disableDrag,
      disableDuplicate,
      maxTasks,
      getPreviousFollowUpQuestionLength,
      addNewTask,
      deleteTask,
      duplicateTask,
    }
  },
})
</script>

<template>
  <SmoothDrag
    v-model="modelSync"
    group-tag="ol"
    group-class="grid"
    :disabled="disableDrag"
  >
    <li v-for="(task, i) in modelSync" :id="task.id" :key="i">
      <div class="flex items-center justify-between mb-20">
        <h3 class="font-semibold">Task {{ i + 1 }}</h3>

        <div class="flex space-x-28">
          <Tooltip
            v-slot="{ events }"
            :label="
              modelSync.length > 9
                ? 'Max task is 9'
                : getPreviousFollowUpQuestionLength() > 25
                ? 'Max questions is 26'
                : 'Duplicate task'
            "
          >
            <span v-on="events">
              <PIcon
                source="DuplicateMinor"
                class="fill-icon-default cursor-pointer"
                :class="{
                  'pointer-events-none opacity-60': disableDuplicate,
                }"
                @click="duplicateTask(i)"
              />
            </span>
          </Tooltip>

          <Tooltip
            v-slot="{ events }"
            :label="disableDrag ? 'Min task is 1' : 'Delete task'"
          >
            <span v-on="events">
              <PIcon
                source="DeleteMajor"
                class="fill-icon-default cursor-pointer"
                :class="{ 'pointer-events-none opacity-60': disableDrag }"
                @click="deleteTask(i)"
              />
            </span>
          </Tooltip>
        </div>
      </div>

      <div class="flex space-x-16">
        <span
          class="cursor-grab active:cursor-grabbing transition-opacity inline-block shrink-0"
          :class="{ 'pointer-events-none opacity-20': disableDrag }"
        >
          <PIcon
            source="DragHandleMinor"
            class="shrink-0 fill-icon-default w-16 h-16 drag-handle"
          />
        </span>

        <div class="grow">
          <TextField
            v-model="task.title"
            :placeholder="taskPlaceholder"
            required
            v-bind="idAndError(`${id}-${i}-task`)"
          />

          <FollowUpQuestion
            v-model="task.followUpQuestions"
            :question-id="questionId"
            :root-number="rootNumber"
            :id-and-error="idAndError"
            :previous-follow-up-question-length="
              i === 0 ? 0 : getPreviousFollowUpQuestionLength(i)
            "
            :total-follow-up-questions-length="
              getPreviousFollowUpQuestionLength()
            "
            has-task
          />

          <div v-if="i === modelSync.length - 1" class="mt-20 flex justify-end">
            <Tooltip
              v-slot="{ events }"
              label="Max tasks added!"
              open-delay="16"
              :disabled="!maxTasks"
            >
              <span v-on="events">
                <Button primary :disabled="maxTasks" @click="addNewTask">
                  Add new task
                </Button>
              </span>
            </Tooltip>
          </div>

          <div v-else class="mb-20"></div>
        </div>
      </div>
    </li>
  </SmoothDrag>
</template>
