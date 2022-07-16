<script lang="ts">
import { computed, defineComponent, PropType, ref } from '@vue/composition-api'
import { capitalize, getAlphabets } from '~/utils'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'
import { TestSuiteViewResultState } from '~/store/testSuite/viewResult'

export default defineComponent({
  name: 'AppCreateTestResultPreviewQuestionItem',
  components: { FadeTransition },

  props: {
    index: {
      type: Number,
      required: true,
    },
    question: {
      type: Object as PropType<TestSuiteViewResultState['questions']['question-1']>,
      required: true,
    },
  },
  setup(_props) {
    const expanded = ref(true)

    const hasChoices = computed(() =>
      /^(?:multi-choice|checkbox)$/.test(_props.question.type)
    )

    const getType = (type: string) => capitalize(type).replace(/-/g, ' ')

    const toggleExpand = () => {
      expanded.value = !expanded.value
    }

    return {
      expanded,
      hasChoices,
      getType,
      getAlphabets,
      toggleExpand,
      capitalize,
    }
  },
})
</script>

<template>
  <section>
    <header>
      <Id v-slot="{ id }">
        <label
          :for="id"
          class="text-heading flex items-center justify-between cursor-pointer"
          @click="toggleExpand"
        >
          <p class="grow">
            <strong class="text-text-subdued font-sf-pro-display"
              >{{ getAlphabets(index) }}.</strong
            >

            <PBadge class="bg-surface-neutral-default ml-8" size="small">
              {{ getType(question.type) }}
            </PBadge>
          </p>

          <Button
            :id="id"
            plain
            class="group pointer-events-none"
            @keydown.space="toggleExpand"
          >
            <div class="flex-centered">
              <PIcon
                :source="expanded ? 'CaretUpMinor' : 'CaretDownMinor'"
                class="fill-icon text-icon-default opacity-70 group-hover:opacity-100 group-focus:opacity-100"
              />
              <span class="sr-only">Expand</span>
            </div>
          </Button>
        </label>
      </Id>
    </header>

    <div
      class="transition-all"
      :class="{ 'mt-10 mb-8': expanded, 'min-h-[10px]': !expanded }"
    >
      <FadeTransition :duration="{ leave: 1 }">
        <div v-if="expanded">
          <p class="font-medium">
            {{ question.title }}
          </p>

          <div v-if="hasChoices" class="mt-16">
            <strong class="text-sub-heading block mb-8"> Choices </strong>

            <ul>
              <li
                v-for="(choice, i) in question.choices.options"
                :key="i"
                class="txt-text-subdued font-light"
              >
                <span class="scale-[1.25] inline-block font-medium">
                  •&nbsp;
                </span>
                {{ choice }}
              </li>
            </ul>
          </div>

          <div
            v-else-if="question.type === 'linear-scale'"
            class="grid gap-y-8 text-sub-heading mt-16"
          >
            <p>
              <strong> Type: </strong>

              <span>
                {{ capitalize(question.linearScale.type) }}
              </span>
            </p>

            <p>
              <strong> Start: </strong>

              <span>
                {{ question.linearScale.start.value }}
              </span>
            </p>

            <p>
              <strong> End: </strong>

              <span>
                {{ question.linearScale.end.value }}
              </span>
            </p>
          </div>
        </div>
      </FadeTransition>
    </div>

    <hr class="h-1 w-full border-t border-divider/50" />
  </section>
</template>
