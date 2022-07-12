<script lang="ts">
import { computed, defineComponent, ref, watch } from '@vue/composition-api'
import InputField from '../../InputField/index.vue'
import BlankPage from '../BlankPage/index.vue'
import AnswerTestPageTransition from '~/components/Base/AnswerTestPageTransition/index.vue'
import Button from '~/components/Base/Button/index.vue'
import SmoothDrag from '~/components/Base/SmoothDrag/index.vue'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'
import { scrollMain } from '~/utils'
import Tooltip from '~/components/Base/Tooltip/index.vue'

export default defineComponent({
  name: 'AnswerTestTemplateFiveSecondsTest',
  components: {
    InputField,
    AnswerTestPageTransition,
    Button,
    BlankPage,
    SmoothDrag,
    FadeTransition,
    Tooltip,
  },
  setup(_, { root }) {
    const submittingCardSorting = ref(false)

    const contentRefreshKey = ref(0)

    const notConfirmed = computed(() => {
      return root.$route.params.question.endsWith('-instruction')
    })

    const questionIndex = computed(() =>
      parseFloat(root.$route.params.question)
    )

    const questionIndexAndLetter = computed(() =>
      root.$route.params.question.replace(/-instruction/, '')
    )

    const currentSection = computed(() => {
      return (
        root.$store.state['answer-test'].form[
          `question-${questionIndex.value}`
        ] || {}
      )
    })

    const watchCardsAndCategories = computed(() => {
      return [currentSection.value.cards, currentSection.value.categories]
    })

    const cards = ref<string[]>()

    const categories = ref<{ title: string; items: string[] }[]>([])

    const disableCardSortingSubmit = computed(() => {
      const initialState =
        cards.value && cards.value.length === currentSection.value.cards.length

      return initialState || !!(cards.value || []).length
    })

    const setModel = () => {
      if (currentSection.value.id) {
        cards.value = currentSection.value.cards

        categories.value = []
        ;(currentSection.value.categories as string[]).forEach((item) => {
          categories.value.push({
            title: item,
            items: [],
          })
        })
      }
    }

    setModel()

    watch(() => watchCardsAndCategories.value, setModel)

    const resetContent = () => {
      contentRefreshKey.value += 1

      scrollMain(0)

      setModel()
    }

    const answerCardSorting = async () => {
      submittingCardSorting.value = true

      await root.$store.dispatch('answer-test/confirmSection', categories.value)

      submittingCardSorting.value = false
    }

    return {
      cards,
      categories,
      currentSection,
      notConfirmed,
      questionIndexAndLetter,
      contentRefreshKey,
      disableCardSortingSubmit,
      submittingCardSorting,
      resetContent,
      answerCardSorting,
    }
  },
})
</script>

<template>
  <AnswerTestPageTransition>
    <div v-if="notConfirmed" class="h-max">
      <div class="sticky top-0 z-1">
        <div class="px-[1rem] h-76 bg-surface-default shadow-divide-header">
          <div class="flex-centered relative h-full max-w-[1312px] mx-auto">
            <h2 class="font-semibold">
              {{ currentSection.task }}
            </h2>

            <Tooltip
              v-slot="{ events }"
              :disabled="!disableCardSortingSubmit"
              label="Arrange all cards!"
              class="absolute right-0"
            >
              <span v-on="events">
                <Button
                  primary
                  :disabled="disableCardSortingSubmit"
                  class="cursor-pointer"
                  :loading="submittingCardSorting"
                  @click="answerCardSorting"
                >
                  Continue
                </Button>
              </span>
            </Tooltip>
          </div>
        </div>
      </div>
      <!-- content -->
      <FadeTransition>
        <div
          v-if="cards"
          :key="contentRefreshKey"
          class="grid grid-cols-2 bg-sky-light h-max gap-x-96 py-60"
        >
          <!-- cards -->
          <!-- Abg leave the nested divs, it's a hack for sticky positioning -->
          <div>
            <div class="w-full sticky top-136">
              <div class="shrink-0 grow">
                <div class="float-right w-full max-w-[335px]">
                  <h3 class="mb-8">Cards</h3>
                  <div
                    class="rounded-lg bg-surface-default shadow-2 py-20 pl-16 pr-16 max-h-[calc(100vh-248px)] overflow-y-auto"
                  >
                    <SmoothDrag
                      v-model="cards"
                      group="sections"
                      group-class="grid gap-y-18 empty:h-38 "
                    >
                      <div
                        v-for="(item, i) in cards"
                        :key="i"
                        class="h-36 w-full flex items-center drag-handle"
                      >
                        <PIcon
                          source="DragHandleMinor"
                          class="fill-icon-default w-16 h-16 shrink-0"
                        />

                        <div
                          class="rounded py-8 px-12 border border-[#BABFC3] shrink-0 grow mx-14 bg-surface-default"
                        >
                          {{ item }}
                        </div>
                      </div>
                    </SmoothDrag>
                  </div>

                  <div class="w-full text-center mt-16">
                    <Button
                      v-if="cards && !cards.length"
                      plain
                      @click="resetContent"
                    >
                      Reset cards
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- categories -->
          <div class="mt-28">
            <div class="grid gap-y-16">
              <div
                v-for="(category, index) in categories"
                :key="index"
                class="bg-surface-default rounded-lg shadow-2 p-20 max-w-[418px]"
              >
                <h3 class="mb-16">
                  {{ category.title }}
                </h3>

                <div
                  class="rounded-lg border border-dashed border-border-default min-h-[168px]"
                >
                  <SmoothDrag
                    v-model="category.items"
                    group="sections"
                    group-class="h-full min-h-[168px] px-40 py-20 grid gap-y-10 items-center content-center"
                  >
                    <div
                      v-for="(item, i) in category.items"
                      :key="i"
                      class="h-36 w-full flex items-center drag-handle"
                    >
                      <PIcon
                        source="DragHandleMinor"
                        class="fill-icon-default w-16 h-16 shrink-0"
                      />

                      <div
                        class="rounded py-8 px-12 border border-[#BABFC3] shrink-0 grow mx-14 bg-surface-default"
                      >
                        {{ item }}
                      </div>
                    </div>
                  </SmoothDrag>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeTransition>
    </div>

    <BlankPage v-else :key="$route.fullPath">
      <InputField />
    </BlankPage>
  </AnswerTestPageTransition>
</template>
