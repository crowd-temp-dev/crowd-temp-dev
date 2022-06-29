<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import { ViewResultState } from '~/store/create-test/view-result'
import { getAlphabetIndex } from '~/utils'
import Tooltip from '~/components/Base/Tooltip/index.vue'

type Numbering = `${number}${string}`

export default defineComponent({
  name: 'AppCreateTestResultsDesignSurveyQuestionLinearScale',
  components: { Tooltip },

  props: {
    numbering: {
      type: String as () => Numbering,
      required: true,
    },
  },

  setup(_props, { root }) {
    const viewResult = computed(() => {
      return root.$store.state['create-test']['view-result'] as ViewResultState
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
    const answers = computed(() => {
      const { number, alpha } = qNumberAndAlpha.value
      return viewResult.value.answers
        .map((user) => {
          const answer = user.answers[`${number}`].questions[alpha] || {}
          const value = answer.value
          return {
            value,
          }
        })
        .filter((val) => !!val.value)
    })
    const linearScale = computed(() => {
      const { number, alpha } = qNumberAndAlpha.value
      const questionLinearScale = question.value.linearScale
      const totalParticipants = viewResult.value.answers.filter((user) => {
        return !!(
          ((user.answers[`${number}`].questions || {})[alpha] || {}).value || []
        ).length
      }).length
      const startValue = Number(questionLinearScale.start.value)
      return Array.from(
        {
          length: Number(questionLinearScale.end.value) + 1 - startValue,
        },
        (_, i) => {
          const value = i + startValue
          const participantChoseValue = viewResult.value.answers.filter(
            (user) => {
              return (
                (((user.answers[`${number}`].questions || {})[alpha] || {})
                  .value || [])[0] === `${value}`
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
        }
      )
    })
    return {
      question,
      answers,
      linearScale,
    }
  },
})
</script>

<template>
  <ul class="grid grid-cols-5 gap-36 mt-38 mb-20">
    <li
      v-for="(option, i) in linearScale"
      :key="`answer-choices-${i}`"
      class="relative px-10 rounded-[3px] flex flex-col items-center justify-end border border-divider h-96 isolate"
      :class="['py-8']"
    >
      <Tooltip
        v-slot="{ events }"
        label="Add note"
        class="absolute top-[-18px]"
        :open-delay="500"
      >
        <button
          class="h-36 w-36 rounded-full border border-divider bg-surface-default z-1 focus-visible:ring-2 ring-action-primary-default outline-none transition-[opacity,transform] active:opacity-80 active-scale-[0.99]"
          v-on="events"
        >
          <PIcon source="AddNoteMajor" class="fill-icon-default" />
        </button>
      </Tooltip>

      <div class="border border-divider flex items-center shrink-0">
        <span class="text-caption-sm text-text-subdued pl-8 pr-10">
          {{ option.valuePercent }}
        </span>

        <hr class="h-36 w-1 border-r border-divider" />

        <span
          class="h-36 w-36 mx-4 text-text-subdued text-caption-sm inline-flex items-center justify-center"
        >
          <PIcon source="ProfileMinor" class="fill-icon-default shrink-0 m-0" />
          <span>{{ option.participantChoseValue }}</span>
        </span>
      </div>

      <p class="ml-[0.2rem] flex mr-10 items-end">
        <span class="text-caption-sm text-text-subdued shrink-0"> Value: </span>

        <strong class="ml-8 text-text-subdued inline-block max-w-[420px]">
          {{ option.value }}
        </strong>
      </p>
    </li>
  </ul>
</template>
