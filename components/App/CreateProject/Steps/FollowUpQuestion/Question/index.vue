<script lang="ts">
import {
  computed,
  defineComponent,
  nextTick,
  watch,
} from '@vue/composition-api'
import LabelSwitch from '../../Switch/index.vue'
import { QuestionModelValue, SelectOption, SelectValue } from './type'
import ConditionalLogic from './ConditionalLogic/index.vue'
import LinearScale from './LinearScale/index.vue'
import Choices from './Choices/index.vue'
import Select from '~/components/Base/Select/index.vue'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'
import Tooltip from '~/components/Base/Tooltip/index.vue'

const selectOptions = [
  { label: 'Short text', value: 'short-text' },
  { label: 'Long text', value: 'long-text' },
  { label: 'Multiple choice', value: 'multi-choice' },
  { label: 'Checkbox', value: 'checkbox' },
  { label: 'Linear scale', value: 'linear-scale' },
] as SelectOption[]

export default defineComponent({
  name: 'AppProjectStepsFollowUpQuestionQuestion',
  components: {
    LabelSwitch,
    Choices,
    Select,
    ConditionalLogic,
    FadeTransition,
    LinearScale,
    Tooltip,
  },
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  props: {
    id: {
      type: String,
      default: undefined,
    },
    disableDelete: Boolean,
    questionTitle: {
      type: String,
      required: true,
    },
    appear: Boolean,
    disableDrag: Boolean,
    modelValue: {
      type: Object as () => QuestionModelValue,
      required: true,
    },
    questionId: {
      type: String,
      required: true,
    },
    minLength: {
      type: Number,
      required: true,
    },
    idAndError: {
      type: Function,
      required: true,
    },
    questionIndex: {
      type: Number,
      required: true,
    },
    questionLength: {
      type: Number,
      required: true,
    },
    disableDuplicate: Boolean,
  },
  emits: ['on-delete', 'on-duplicate'],
  setup(_props, { emit }) {
    const modelSync = computed({
      get() {
        return _props.modelValue as QuestionModelValue
      },
      set(val: QuestionModelValue) {
        emit('update:modelValue', val)
      },
    })

    const showChoices = computed(() =>
      (['checkbox', 'multi-choice'] as SelectValue[]).includes(
        modelSync.value.type
      )
    )

    const isLinearScale = computed(
      () => modelSync.value.type === 'linear-scale'
    )

    const gotoConditionalLogic = computed(() => {
      return _props.questionIndex + 2 < _props.questionLength
    })

    const showConditionalLogic = computed(() => {
      return _props.questionIndex
    })

    const conditionalLogicActions = computed(() => {
      return [
        {
          label: 'Go to',
          value: 'goto',
          disabled: !gotoConditionalLogic.value,
        },
        {
          label: 'Show',
          value: 'show',
          disabled: !showConditionalLogic.value,
        },
      ]
    })

    const disableConditionalLogic = computed(() => {
      const isFirst = !_props.questionIndex

      const questionsLength = _props.questionLength

      return questionsLength < 2 || (isFirst && questionsLength < 3)
    })

    // add choices when type changes
    watch(
      () => showChoices.value,
      (nv) => {
        const newValue = {
          ...modelSync.value,
        } as Record<string, any>

        if (nv) {
          newValue.choices = {
            maxSelection: modelSync.value.type === 'checkbox' ? '2' : undefined,
            options: ['', ''],
            addOtherAsChoice: false,
          }
        } else {
          delete newValue.choices
        }

        // @ts-ignore
        modelSync.value = { ...newValue }
      },
      {
        immediate: true,
      }
    )

    // add conditionals when conditionalLogic changes
    watch(
      () => modelSync.value.conditionalLogic,
      () => {
        nextTick(() => {
          const newValue = {
            ...modelSync.value,
          }

          if (modelSync.value.conditionalLogic) {
            newValue.conditionals = {
              action: 'goto',
              question: '',
              questionAnswer: '',
            }
          } else {
            // @ts-ignore
            delete newValue.conditionals
          }

          modelSync.value = { ...newValue }
        })
      }
    )

    // add linear scale options when linear scale is selected.
    // Should run on nextTick to avoid clashing with showChoices watcher above
    watch(
      () => isLinearScale.value,
      () => {
        nextTick(() => {
          const newValue = {
            ...modelSync.value,
          }

          if (isLinearScale.value) {
            newValue.linearScale = {
              type: 'number',
              start: {
                value: '1',
                label: '',
              },
              end: {
                value: '10',
                label: '',
              },
            }
          } else {
            // @ts-ignore
            delete newValue.linearScale
          }

          modelSync.value = { ...newValue }
        })
      }
    )

    const onConditionalLogic = async (evt: boolean) => {
      if (evt && !disableConditionalLogic.value) {
        await nextTick()

        const firstAction =
          showConditionalLogic.value && !gotoConditionalLogic.value
            ? 'show'
            : 'goto'

        await nextTick()

        if (modelSync.value.conditionals) {
          modelSync.value.conditionals.action = firstAction
        } else {
          nextTick(() => console.log('modelSync.value', modelSync.value))
        }
      }
    }

    return {
      selectOptions,
      showChoices,
      modelSync,
      disableConditionalLogic,
      isLinearScale,
      conditionalLogicActions,
      onConditionalLogic,
    }
  },
})
</script>

<template>
  <li :class="{ 'fade-appear': appear }" v-on="$listeners">
    <p class="mb-4">
      {{ questionTitle }}
    </p>

    <div class="flex space-x-14 items-start">
      <span
        class="cursor-grab active:cursor-grabbing transition-opacity inline-block"
        :class="{ 'pointer-events-none opacity-20': disableDrag }"
      >
        <PIcon
          source="DragHandleMinor"
          class="shrink-0 fill-icon-default w-16 h-16 drag-handle"
        />
      </span>

      <div class="flex-grow">
        <div class="flex mb-20">
          <TextField
            v-model="modelSync.title"
            class="mr-10 flex-grow shrink-0"
            type="text"
            :multiline="modelSync.type === 'long-text'"
            :min-height="36"
            required
            v-bind="idAndError(`${id}-title`)"
          />

          <Select
            v-model="modelSync.type"
            :options="selectOptions"
            class="shrink-0"
            required
          />
        </div>

        <div class="flex items-center justify-between">
          <LabelSwitch
            v-model="modelSync.conditionalLogic"
            label="Add conditional Logic"
            :disabled="disableConditionalLogic"
            :tooltip="
              disableConditionalLogic ? 'Add another question' : undefined
            "
            @on-change="onConditionalLogic"
          />

          <div class="flex items-center space-x-26">
            <Tooltip
              :key="questionId"
              v-slot="{ events }"
              :label="
                disableDuplicate
                  ? 'Cannot duplicate'
                  : `Duplicate ${questionTitle}`
              "
              :disabled="disableDuplicate"
            >
              <span class="cursor-pointer" v-on="events">
                <PIcon
                  source="DuplicateMinor"
                  class="fill-icon-default w-16 h-16"
                  :class="{
                    'opacity-50 pointer-events-none': disableDuplicate,
                  }"
                  @click="() => !disableDuplicate && $emit('on-duplicate')"
                />
              </span>
            </Tooltip>

            <LabelSwitch v-model="modelSync.required" label="Required" />

            <Tooltip
              v-slot="{ events }"
              :label="
                disableDelete
                  ? `Min question is ${minLength}`
                  : `Delete ${questionTitle}`
              "
            >
              <span :class="{ 'cursor-pointer': !disableDelete }" v-on="events">
                <PIcon
                  source="DeleteMajor"
                  class="fill-icon-default w-16 h-16"
                  :class="{ 'opacity-50 pointer-events-none': disableDelete }"
                  @click="() => !disableDelete && $emit('on-delete')"
                />
              </span>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>

    <FadeTransition>
      <ConditionalLogic
        v-if="
          modelSync.conditionalLogic &&
          modelSync.conditionals &&
          !disableConditionalLogic
        "
        v-model="modelSync.conditionals"
        :follow-up-question-id="modelSync.id"
        :question-id="questionId"
        :action-options="conditionalLogicActions"
        :question-length="questionLength"
        :question-index="questionIndex"
      />
    </FadeTransition>

    <FadeTransition>
      <div
        v-if="(showChoices && modelSync.choices) || isLinearScale"
        :key="`${showChoices}-${isLinearScale}`"
        class="ml-30"
      >
        <Choices
          v-if="showChoices"
          v-model="modelSync.choices"
          v-bind="
            modelSync.type === 'checkbox'
              ? {
                  showMaxSelection: true,
                  minLength: 2,
                }
              : {}
          "
          :id-and-error="idAndError"
        />
        <LinearScale
          v-else-if="isLinearScale && modelSync.linearScale"
          v-model="modelSync.linearScale"
        />
      </div>
    </FadeTransition>
  </li>
</template>
