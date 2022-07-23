<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api'
import QuestionSection from '../QuestionSection/index.vue'
import Question from '../Question/index.vue'
import viewResultTestType from '~/mixins/view-result-test-type'
import { RootState } from '~/store'

export default defineComponent({
  name: 'AppProjectResultPreferenceTest',
  components: { Question, QuestionSection },
  mixins: [viewResultTestType],
  setup(_props, { root }) {
    const props = computed(() => _props as Record<string, any>)

    const viewResult = computed(() => {
      return (root.$store.state as RootState).projectSuite.viewResult
    })

    const currentQuestion = computed(() => {
      return viewResult.value.questions[`question-${props.value.numbering}`]
    })

    const files = computed(() => {
      const getFiles = currentQuestion.value.files as unknown as string[]

      const totalParticipants = viewResult.value.answers.filter((user) => {
        const currentAnswer = user.answers[`${props.value.numbering}`]

        return !!currentAnswer?.preference
      }).length

      return (getFiles as string[]).map((value) => {
        const participantChoseValue = viewResult.value.answers.filter(
          (user) => {
            const currentAnswer = user.answers[`${props.value.numbering}`]

            if (currentAnswer?.preference) {
              return currentAnswer.preference.file === value
            }
            return false
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

    return { currentQuestion, files }
  },
})
</script>

<template>
  <QuestionSection :title="`${numbering}. Preference Test`">
    <div>
      <strong class="mb-20 inline-block text-[16px] leading-[19px]">
        Preferred version
      </strong>

      <ul class="grid gap-20 mb-20">
        <li
          v-for="(file, i) in files"
          :key="`file-${i}`"
          class="px-10 py-12 rounded-[3px] flex items-center border border-divider"
        >
          <p class="grow ml-[0.2rem] flex items-center mr-10">
            <strong class="ml-8 text-text-subdued inline-block max-w-[420px]">
              Version {{ i + 1 }}
            </strong>
          </p>

          <div class="border border-divider flex items-center shrink-0">
            <span class="text-caption-sm text-text-subdued pl-10 pr-16">
              {{ file.valuePercent }}
            </span>

            <hr class="h-30 w-1 border-r border-divider" />

            <span
              class="h-36 w-46 mx-4 text-text-subdued text-caption-sm inline-flex items-center justify-center"
            >
              <PIcon
                source="ProfileMinor"
                class="fill-icon-default shrink-0 m-0"
              />
              <span>{{ file.participantChoseValue }}</span>
            </span>

            <hr class="h-30 w-1 border-r border-divider" />

            <button
              class="h-36 w-46 focus-visible:ring-2 ring-action-primary-default outline-none"
            >
              <PIcon source="AddNoteMajor" class="fill-icon-default" />
            </button>
          </div>
        </li>
      </ul>
      <hr class="w-full h-1 border-t border-divider" />
    </div>

    <Question
      v-for="(question, index) in followUpQuestions"
      :key="index"
      :numbering="`${numbering}${getAlphabets(index)}`"
    />
  </QuestionSection>
</template>
