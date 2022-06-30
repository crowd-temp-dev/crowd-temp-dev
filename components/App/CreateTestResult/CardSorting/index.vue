<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import QuestionSection from '../QuestionSection/index.vue'
import Question from '../Question/index.vue'
import Item from './Item/index.vue'
import viewResultTestType from '~/mixins/view-result-test-type'
import { ViewResultState } from '~/store/create-test/view-result'

export default defineComponent({
  name: 'AppCreateTestResultCardSorting',
  components: { Question, QuestionSection, Item },
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
        <Item v-for="(category, i) in categories" :key="i" v-bind="category" />
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
