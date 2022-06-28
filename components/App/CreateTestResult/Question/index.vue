<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import _ from 'lodash'
import Button from '~/components/Base/Button/index.vue'
import SearchField from '~/components/Base/SearchField/index.vue'
import { ViewResultState } from '~/store/create-test/view-result'
import { getAlphabetIndex } from '~/utils'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'
import Id from '~/components/Base/Id/index.vue'

type Numbering = `${number}${string}`

export default defineComponent({
  name: 'AppCreateTestResultsDesignSurveyQuestion',
  components: { Button, SearchField, FadeTransition, Id },
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

    const type = computed(() => {
      return _.capitalize(question.value.type).replace(/-/g, ' ')
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

    const isShortOrLongText = computed(() => {
      return /^(?:short|long)-text$/.test(question.value.type)
    })

    const hasChoices = computed(() => {
      return /^(?:checkbox|multi-choice)/.test(question.value.type)
    })

    const choices = computed(() => {
      const { number, alpha } = qNumberAndAlpha.value

      const getChoices = question.value.choices.options

      const totalParticipants = viewResult.value.answers.filter((user) => {
        return !!(
          ((user.answers[`${number}`].questions || {})[alpha] || {}).value || []
        ).length
      }).length

      return (getChoices as string[]).map((value) => {
        const participantChoseValue = viewResult.value.answers.filter(
          (user) => {
            return (
              (((user.answers[`${number}`].questions || {})[alpha] || {})
                .value || [])[0] === value
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

    return { question, type, answers, isShortOrLongText, hasChoices, choices }
  },
})
</script>

<template>
  <div>
    <div class="mb-8 flex items-center space-x-8">
      <h3 class="text-[16px] leading-[19.09px] font-semibold">
        Question {{ numbering }}
      </h3>

      <PBadge class="bg-surface-neutral-default" size="small">
        {{ type }}
      </PBadge>
    </div>

    <p class="mb-20">
      {{ question.title }}
    </p>

    <div class="flex items-center justify-between space-x-12">
      <SearchField
        placeholder="Search responses"
        outlined
        class="max-w-[270px] w-full shrink-0"
      />

      <div
        class="flex items-center justify-end space-x-6 w-full flex-wrap space-y-6 xl:space-y-0"
      >
        <!-- <select field> -->
        <div class="relative isolate shrink-0 w-full max-w-[194px]">
          <Select :options="[{ label: 'Participants', value: 'participants' }]">
            <template #preview>
              <div
                class="absolute h-full w-full top-1 z-10 left-1 rounded-lg flex items-center"
              >
                <span class="text-text-subdued shrink-0"> Show by </span>

                &nbsp;Participants
              </div>
            </template>
          </Select>
        </div>
        <!-- </select-field> -->

        <Button> Filter results </Button>

        <Button icon="StarFilledMinor"> Starred </Button>
      </div>
    </div>

    <FadeTransition>
      <div
        v-if="!answers.length"
        class="bg-action-primary-disabled px-10 h-40 rounded-[3px] w-full my-20 flex items-center"
      >
        <strong class="text-text-subdued"> No response yet </strong>
      </div>

      <div v-else>
        <ul v-if="isShortOrLongText" class="my-20 grid gap-y-8">
          <li
            v-for="(answer, i) in answers"
            :key="`answer-${i}`"
            class="px-10 rounded-[3px] flex items-center border border-divider"
            :class="[question.type === 'long-text' ? 'py-14' : 'py-8']"
          >
            <Id v-if="isShortOrLongText" v-slot="{ id }">
              <Checkbox :id="id" class="shrink-0 ml-15" />
            </Id>

            <p class="grow ml-[0.2rem] flex items-center mr-10">
              <span class="text-caption-sm text-text-subdued shrink-0">
                Participant {{ i + 1 }}:
              </span>

              <strong class="ml-8 text-text-subdued inline-block max-w-[420px]">
                {{ answer.value[0] }}
              </strong>
            </p>

            <div class="border border-divider flex items-center py-4 shrink-0">
              <button
                class="h-36 w-46 focus-visible:ring-2 ring-action-primary-default outline-none"
              >
                <PIcon source="StarOutlineMinor" class="fill-icon-default" />
              </button>

              <hr class="h-36 w-1 border-r border-divider" />

              <button
                class="h-36 w-46 focus-visible:ring-2 ring-action-primary-default outline-none"
              >
                <PIcon source="AddNoteMajor" class="fill-icon-default" />
              </button>
            </div>
          </li>
        </ul>

        <ul v-else-if="hasChoices" class="my-20 grid gap-y-8">
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
                <PIcon
                  source="ProfileMinor"
                  class="fill-icon-default shrink-0 m-0"
                />
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
      </div>
    </FadeTransition>

    <hr />
  </div>
</template>
