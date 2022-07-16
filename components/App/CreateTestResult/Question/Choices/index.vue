<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import { RootState } from '~/store'
import { capitalize, getAlphabetIndex } from '~/utils'

type Numbering = `${number}${string}`

export default defineComponent({
  name: 'AppCreateTestResultsDesignSurveyQuestionChoices',
  props: {
    numbering: {
      type: String as () => Numbering,
      required: true,
    },
  },
  setup(_props, { root }) {
    const viewResult = computed(() => {
      return (root.$store.state as RootState).testSuite.viewResult
    })

    const qNumberAndAlpha = computed(() => {
      const number = _props.numbering.replace(/[a-z]+$/, '')

      const alpha = _props.numbering.replace(/^\d/, '')

      return { number, alpha }
    })

    const question = computed(() => {
      const { number, alpha } = qNumberAndAlpha.value

      return viewResult.value.questions[`question-${number}`].followUpQuestions[
        getAlphabetIndex(alpha)
      ]
    })

    const type = computed(() => {
      return capitalize(question.value.type).replace(/-/g, ' ')
    })

    const answers = computed(() => {
      const { number, alpha } = qNumberAndAlpha.value

      return viewResult.value.answers
        .map((user) => {
          const answer =
            ((user.answers[`${number}`] || {}).questions || {})[alpha] || {}

          const value = answer.value

          return {
            value,
          }
        })
        .filter((val) => !!val.value)
    })

    const choices = computed(() => {
      const { number, alpha } = qNumberAndAlpha.value

      const getChoices = question.value.choices.options

      const totalParticipants = viewResult.value.answers.filter((user) => {
        return !!(
          (((user.answers[`${number}`] || {}).questions || {})[alpha] || {})
            .value || []
        ).length
      }).length

      return (getChoices as string[]).map((value) => {
        const participantChoseValue = viewResult.value.answers.filter(
          (user) => {
            return (
              ((
                ((user.answers[`${number}`] || {}).questions || {})[alpha] || {}
              ).value || [])[0] === value
            )
          }
        ).length

        return {
          value,
          participantChoseValue,
          valuePercent: `${
            participantChoseValue
              ? ((participantChoseValue / totalParticipants) * 100).toFixed(0)
              : '0'
          }%`,
        }
      })
    })

    return {
      question,
      type,
      answers,
      choices,
    }
  },
})
</script>

<template>
  <ul class="my-20 grid gap-y-8">
    <li
      v-for="(choice, i) in choices"
      :key="`answer-choices-${i}`"
      class="px-10 rounded-[3px] flex items-center border border-divider"
      :class="['py-8']"
    >
      <p class="grow ml-[0.2rem] flex items-center mr-10">
        <span class="text-caption-sm text-text-subdued shrink-0">
          Option {{ i + 1 }}:
        </span>

        <strong class="ml-8 text-text-subdued inline-block max-w-[420px]">
          {{ choice.value }}
        </strong>
      </p>

      <div class="border border-divider flex items-center py-4 shrink-0">
        <span class="text-caption-sm text-text-subdued pl-10 pr-16">
          {{ choice.valuePercent }}
        </span>

        <hr class="h-36 w-1 border-r border-divider" />

        <span
          class="h-36 w-46 mx-4 text-text-subdued text-caption-sm inline-flex items-center justify-center"
        >
          <PIcon source="ProfileMinor" class="fill-icon-default shrink-0 m-0" />
          <span>{{ choice.participantChoseValue }}</span>
        </span>

        <hr class="h-36 w-1 border-r border-divider" />

        <button
          class="h-36 w-46 focus-visible:ring-2 ring-action-primary-default outline-none"
        >
          <PIcon source="AddNoteMajor" class="fill-icon-default" />
        </button>
      </div>
    </li>
  </ul>
</template>
