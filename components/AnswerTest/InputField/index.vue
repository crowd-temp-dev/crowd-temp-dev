<script lang="ts">
import { computed, defineComponent, ref, watch } from '@vue/composition-api'
import { QuestionModelValue } from '~/components/App/CreateTest/Steps/FollowUpQuestion/Question/type'
import { AnswerTestState } from '~/store/answer-test'
import { OnSubmit } from '~/types'
import { getAlphabetIndex } from '~/utils'
import Id from '~/components/Base/Id/index.vue'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'
import Checkbox from '~/components/Base/Checkbox/index.vue'

export default defineComponent({
  name: 'AnswerTestInputField',
  components: { Id, FadeTransition, Checkbox },
  props: {
    readonly: Boolean,
    appendValues: {
      type: Array,
      default: undefined,
    },
    contentClass: {
      type: String,
      default: undefined,
    },
    titleClass: {
      type: String,
      default: 'font-semibold mb-[0.5rem]',
    },
    questionTitleClass: {
      type: String,
      default: undefined,
    },
  },

  setup(_props, { root }) {
    const showOther = ref(false)

    const skipping = ref(false)

    const currentQuestion = computed<QuestionModelValue>(() => {
      const questionForm = (root.$store.state['answer-test'] as AnswerTestState)
        .form
      if (questionForm.empty) {
        return {} as QuestionModelValue
      }
      const questionId = root.$route.params.question as string
      const qIndex = Number(questionId.replace(/[a-z]+$/, ''))
      const qIndexLetter = questionId.replace(/\d/g, '')
      const followUps = questionForm[`question-${qIndex}`].followUpQuestions
      return (followUps?.[getAlphabetIndex(qIndexLetter)] ||
        {}) as QuestionModelValue
    })

    // const isLastQuestion = computed(()=>  (root.$store.state['answer-test'] as AnswerTestState)
    //     .form)

    const isTextField = computed(() =>
      ['short-text', 'long-text'].includes(currentQuestion.value.type)
    )

    const isOptionsType = computed(() => {
      return ['multi-choice', 'checkbox'].includes(currentQuestion.value.type)
    })

    const isLinearScale = computed(() => {
      return currentQuestion.value.type === 'linear-scale'
    })

    const linearScaleValue = ref<number>()

    const linearScaleOptions = computed(() => {
      if (!isLinearScale) {
        return []
      }

      const linearScale = currentQuestion.value.linearScale

      const startValue = Number(linearScale.start.value)
      const endValue = Number(linearScale.end.value)

      const values = Array.from(
        {
          length: endValue + 1 - startValue,
        },
        (_, i) => i + startValue
      )

      return values.map((value) => ({
        value,
        onClick: () => {
          linearScaleValue.value = value

          console.log(value)
        },
      }))
    })

    const setFreshChoices = () =>
      currentQuestion.value.type === 'checkbox'
        ? Array.from(
            {
              length: currentQuestion.value.choices.options.length,
            },
            () => false
          )
        : []

    const choicesModel = ref<boolean[]>(setFreshChoices())

    watch(
      () => currentQuestion.value.id,
      (nv) => {
        if (nv) {
          choicesModel.value = setFreshChoices()
        }
      }
    )

    const getAppendedValue = (val: string[]) => {
      if (!_props.appendValues) {
        return val
      }

      return [...val, _props.appendValues]
    }

    const submitForm: OnSubmit<Record<string, string>> = async ({
      formValues,
      toggleLoading,
      formElement,
    }) => {
      toggleLoading(true)
      let values = Object.values(formValues) as any[]

      // if (currentQuestion.value.required) {
      if (['checkbox', 'multi-choice'].includes(currentQuestion.value.type)) {
        const { options, addOtherAsChoice } = currentQuestion.value.choices

        values = (values as boolean[])
          .map((val, index) => (val ? options[index] : null))
          .filter((x) => x !== null)

        if (addOtherAsChoice && showOther.value) {
          const otherValue = `${root.$nuxt.$config.otherPrefix}${formValues['other-value']}`

          if (currentQuestion.value.type === 'checkbox') {
            values.push(otherValue)
          } else {
            values = [otherValue]
          }
        }
      }
      // }

      if (currentQuestion.value.type === 'linear-scale') {
        values = [linearScaleValue.value?.toString()].filter(Boolean)
      }

      if (!values.length) {
        root.$pToast.open({
          message: 'Enter a value',
          error: true,
        })
        ;(formElement.elements[0] as HTMLElement).focus()
      } else {
        await root.$store.dispatch(
          'answer-test/answerQuestion',
          getAppendedValue(
            values.filter((val) => val !== null && val !== undefined)
          )
        )
      }

      toggleLoading(false)
    }

    const skipQuestion = async () => {
      skipping.value = true

      await root.$store.dispatch(
        'answer-test/answerQuestion',
        getAppendedValue([root.$nuxt.$config.skipQuestion])
      )

      skipping.value = false
    }

    return {
      currentQuestion,
      isTextField,
      showOther,
      isOptionsType,
      choicesModel,
      isLinearScale,
      linearScaleOptions,
      linearScaleValue,
      skipping,
      submitForm,
      skipQuestion,
    }
  },
})
</script>

<template>
  <div class="px-[1rem]">
    <h2 :class="titleClass">Question {{ $route.params.question }}</h2>

    <p
      v-if="isOptionsType || isLinearScale"
      class="mb-8"
      :class="questionTitleClass"
    >
      {{ currentQuestion.title }}
    </p>

    <FormLayout
      v-slot="{ fieldIdAndError, loading }"
      :name="$route.fullPath"
      @on-submit="submitForm"
    >
      <div class="grid gap-y-20" :class="contentClass">
        <TextField
          v-if="isTextField"
          :label="currentQuestion.title"
          required
          :autofocus="!readonly"
          class="min-w-[28rem] lg:min-w-[438px] max-w-full"
          v-bind="fieldIdAndError('text-field')"
          pattern="^.{1,255}$"
          :multiline="currentQuestion.type === 'long-text'"
          :min-height="72"
          :readonly="loading || readonly"
        />

        <template v-if="isOptionsType">
          <RadioGroup
            v-if="currentQuestion.type === 'multi-choice'"
            class="grid gap-y-2"
          >
            <Id
              v-for="(choice, i) in currentQuestion.choices.options"
              :key="i"
              v-slot="{ id }"
            >
              <Radio
                :label="choice"
                v-bind="fieldIdAndError(id)"
                :disabled="showOther"
              />
            </Id>
          </RadioGroup>

          <div v-else class="grid gap-y-8">
            <Checkbox
              v-for="(choice, i) in currentQuestion.choices.options"
              :key="i + choicesModel.length"
              v-model="choicesModel[i]"
              :label="choice"
              v-bind="fieldIdAndError(`${choice}-${i}`)"
            />
          </div>

          <div v-if="currentQuestion.choices.addOtherAsChoice">
            <Id v-slot="{ id }">
              <label :for="id" class="flex cursor-pointer items-center">
                <Checkbox v-model="showOther" v-bind="fieldIdAndError(id)" />

                <strong class="uppercase text-text-subdued"> Other </strong>
              </label>
            </Id>

            <FadeTransition>
              <TextField
                v-if="showOther"
                v-bind="fieldIdAndError('other-value')"
                required
                :autofocus="!readonly"
                :readonly="loading || readonly"
                pattern="^.{1,255}$"
                class="min-w-[28rem] lg:min-w-[438px] max-w-full"
              />
            </FadeTransition>
          </div>
        </template>

        <div v-if="isLinearScale" class="w-fit">
          <div class="flex text-text-subdued justify-between items-center">
            <p>
              {{ currentQuestion.linearScale.start.label || 'Start' }}
            </p>

            <p>
              {{ currentQuestion.linearScale.end.label || 'End' }}
            </p>
          </div>
          <ul class="flex items-center space-x-6 mt-12">
            <li
              v-for="option in linearScaleOptions"
              :key="`linear-${option.value}`"
            >
              <Button
                class="p-0"
                :class="{
                  'ring-2 ring-action-primary-default ring-offset-1':
                    linearScaleValue === option.value,
                }"
                @click="option.onClick"
              >
                {{ option.value }}
              </Button>
            </li>
          </ul>
        </div>
      </div>

      <slot name="action" v-bind="{ skipQuestion }">
        <div class="flex space-x-16">
          <Button
            type="submit"
            primary
            class="w-fit"
            :tabindex="readonly || loading ? '-1' : undefined"
            :loading="loading"
          >
            Continue
          </Button>

          <Button
            v-if="!currentQuestion.required"
            class="pointer-events-auto"
            :loading="skipping"
            @click="skipQuestion"
          >
            Skip
          </Button>
        </div>
      </slot>
    </FormLayout>
  </div>
</template>
