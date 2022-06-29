<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import {
  UpdateAnswerPayload,
  ViewResultState,
} from '~/store/create-test/view-result'
import { getAlphabetIndex } from '~/utils'
import Id from '~/components/Base/Id/index.vue'
import Spinner from '~/components/Base/Spinner/index.vue'
import Tooltip from '~/components/Base/Tooltip/index.vue'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'

type Numbering = `${number}${string}`

export default defineComponent({
  name: 'AppCreateTestResultsDesignSurveyQuestionShortOrLongText',
  components: { Id, Spinner, Tooltip, FadeTransition },
  props: {
    numbering: {
      type: String as () => Numbering,
      required: true,
    },
    limit: {
      type: Number,
      default: undefined,
    },
    starred: Boolean,
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
          const answer =
            ((user.answers[`${number}`] || {}).questions || {})[alpha] || {}

          return answer
        })
        .filter((val) => {
          const hasValue = !!val.value

          let canShow = true

          if (_props.starred) {
            canShow = val.favourite
          }

          return hasValue && canShow
        })
        .slice(0, _props.limit)
    })

    const toggleFavourite = async (index: number) => {
      const { number, alpha } = qNumberAndAlpha.value

      await root.$store.dispatch('create-test/view-result/updateAnser', {
        followUpAlpha: alpha,
        qIndex: Number(number),
        userIndex: index,
        values: { favourite: !answers.value[index].favourite },
      } as UpdateAnswerPayload)
    }

    return {
      viewResult,
      question,
      answers,
      toggleFavourite,
    }
  },
})
</script>

<template>
  <FadeTransition>
    <ul :key="`length:${!!answers.length}`" class="my-20 grid gap-y-8">
      <template v-if="answers.length">
        <li
          v-for="(answer, i) in answers"
          :key="`answer-${i}`"
          class="px-10 rounded-[3px] flex items-center border border-divider"
          :class="[question.type === 'long-text' ? 'py-14' : 'py-8']"
        >
          <Id v-slot="{ id }">
            <Checkbox :id="id" class="shrink-0 ml-15" />
          </Id>

          <p class="grow ml-[0.2rem] flex items-center mr-10">
            <span class="text-caption-sm text-text-subdued shrink-0">
              {{ viewResult.answers[i].username }} {{ i + 1 }}:
            </span>

            <strong class="ml-8 text-text-subdued inline-block max-w-[420px]">
              {{ answer.value[0] }}
            </strong>
          </p>

          <div class="border border-divider flex items-center py-4 shrink-0">
            <Tooltip
              v-slot="{ events }"
              :open-delay="500"
              label="Favourite"
              :disabled="answer.loading"
            >
              <button
                class="h-36 w-46 focus-visible:ring-2 ring-action-primary-default outline-none transition-[opacity,transform] active:opacity-60 active:scale-[0.99]"
                v-on="events"
                @click="toggleFavourite(i)"
              >
                <div class="flex-centered">
                  <Spinner v-if="answer.loading" class="fill-icon-default" />

                  <PIcon
                    v-else
                    :source="
                      answer.favourite ? 'StarFilledMinor' : 'StarOutlineMinor'
                    "
                    class="fill-icon-default"
                  />
                </div>
              </button>
            </Tooltip>

            <hr class="h-36 w-1 border-r border-divider" />

            <Tooltip v-slot="{ events }" label="Add notes" :open-delay="500">
              <button
                class="h-36 w-46 focus-visible:ring-2 ring-action-primary-default outline-none"
                v-on="events"
              >
                <PIcon source="AddNoteMajor" class="fill-icon-default" />
              </button>
            </Tooltip>
          </div>
        </li>
      </template>

      <li v-else class="text-text-subdued flex-centered pt-10">
        <span class="mr-8">
          <PIcon source="AlertMinor" class="fill-icon-default shrink-0" />
        </span>
        <strong class=""> No result! </strong>
      </li>
    </ul>
  </FadeTransition>
</template>
