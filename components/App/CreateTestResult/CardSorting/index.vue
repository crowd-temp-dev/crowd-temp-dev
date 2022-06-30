<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import QuestionSection from '../QuestionSection/index.vue'
import Question from '../Question/index.vue'
import viewResultTestType from '~/mixins/view-result-test-type'
import { ViewResultState } from '~/store/create-test/view-result'

export default defineComponent({
  name: 'AppCreateTestResultCardSorting',
  components: { Question, QuestionSection },
  mixins: [viewResultTestType],
  setup(_props, { root }) {
    const props = computed(() => _props as Record<string, any>)

    const viewResult = computed(
      () => root.$store.state['create-test']['view-result'] as ViewResultState
    )

    const currentQuestion = computed(() => {
      return viewResult.value.questions[`question-${props.value.numbering}`]
    })

    const usersThatSortedCards = computed(() => {
      return viewResult.value.answers.filter((user) => {
        return Object.values(user.answers).find((x) => 'cardSorting' in x)
      })
    })

    const cardSorted = computed(() => {
      return !!usersThatSortedCards.value.length
    })

    const categories = computed(() => {
      if (cardSorted.value) {        
        return currentQuestion.value.categories.map((category, index) => {
          const allCards = usersThatSortedCards.value
            .map((user) => {
              const cardCategory =
                user.answers[`${props.value.numbering}`].cardSorting[index]

              if (cardCategory.title === category) {
                return cardCategory.items
              }

              return null
            })
            .filter(Boolean)
            .flat()

          const distinctCards = Array.from(new Set(allCards)).map(
            (cardTitle) => {
              return {
                title: cardTitle,
                repeated: allCards.filter((card) => card === cardTitle).length,
              }
            }
          )

          return {
            category,
            cards: distinctCards,
          }
        })
      }
      return []
    })

    return { currentQuestion, cardSorted, categories, usersThatSortedCards }
  },
})
</script>

<template>
  <QuestionSection :title="`${numbering}. Card Sorting`">
    <div>
      <p class="text-[16px] leading-[19px] mb-20">
        <strong> Card arrangements </strong>
      </p>

      <div v-if="cardSorted" class="grid gap-y-20 mb-20">
        <div
          v-for="(category, i) in categories"
          :key="i"
          class="rounded-[3px] border border-divider"
        >
          <p class="h-60 flex items-center border-b border-divider p-20">
            <strong class="text-text-subdued">
              {{ category.category }}
            </strong>
          </p>

          <div class="min-h-[62px] bg-surface-subdued p-20 flex">
            <ul class="grow grid grid-flow-col gap-8 justify-start">
              <li
                v-for="(card, cardIndex) in category.cards"
                :key="cardIndex"
                class="flex items-center justify-center space-x-4 h-22 rounded-[10px] py-2 px-8 min-w-[82px] bg-surface-neutral-default text-[13px] leading-[16px] w-fit"
              >
                <span>
                  {{ card.title }}
                </span>

                <span
                  class="inline-flex justify-center items-center text-white w-14 h-14 rounded-full bg-icon-default text-[10px] leading-[12px]"
                >
                  {{ card.repeated }}
                </span>
              </li>
            </ul>

            <Button plain>
              <div class="flex-centered">
                <PIcon source="CaretDownMinor" class="fill-icon-default" />
                <span class="sr-only">Expand</span>
              </div>
            </Button>
          </div>
        </div>
      </div>

      <div
        v-else
        class="bg-action-primary-disabled px-10 h-40 rounded-[3px] w-full my-20 flex items-center"
      >
        <strong class="text-text-subdued"> No response yet </strong>
      </div>

      <hr class="h-1 w-full border-t border-divider" />
    </div>

    <Question
      v-for="(question, index) in followUpQuestions"
      :key="index"
      :numbering="`${numbering}${getAlphabets(index)}`"
    />
  </QuestionSection>
</template>
