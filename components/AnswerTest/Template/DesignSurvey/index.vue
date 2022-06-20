<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api'
import InputField from '../../InputField/index.vue'
import TwoToneBg from '../../TwoToneBg/index.vue'
import PageTransition from '../../PageTransition/index.vue'

export default defineComponent({
  name: 'AnswerTestTemplateDesignSurvey',
  components: { InputField, TwoToneBg, PageTransition },
  setup(_, { root }) {
    const expanded = ref(false)

    const currentSection = computed(() => {
      const questionIndex = root.$route.params.question.replace(/[a-z]$/, '')

      return (
        root.$store.state['answer-test'].form[`question-${questionIndex}`] || {}
      )
    })

    const imgSrc = computed(() =>
      currentSection.value.file ? `/file/${currentSection.value.file}` : ''
    )

    return { expanded, currentSection, imgSrc }
  },
})
</script>

<template>
  <TwoToneBg>
    <template #left>
      <div class="flex-centered h-full w-full">
        <Transition
          :enter-class="
            expanded ? 'scale-[0.95] opacity-0' : 'scale-[1.05] opacity-0'
          "
          :enter-active-class="`transition-[opacity,transform] duration-[250ms] ${
            expanded ? 'origin-left' : 'origin-right'
          }`"
          :leave-to-class="
            expanded ? 'scale-[1.05] opacity-5' : 'scale-[0.95] opacity-5'
          "
          :leave-active-class="`transition-[opacity,transform] ${
            expanded ? 'origin-right' : 'origin-left'
          }`"
          :duration="{
            leave: 70,
          }"
        >
          <div
            :key="`expanded-${expanded}`"
            class="w-full max-w-[620px] transform-gpu ease-[var(--ease-back-out)]"
            :class="{
              'rounded-lg bg-surface-default shadow-2 p-20': !expanded,
              'bg-sky-light fixed top-56 left-0 min-w-full min-h-[calc(100%-56px)] z-20':
                expanded,
            }"
          >
            <div
              class="flex items-center justify-between"
              :class="{
                'bg-surface-default shadow-divide-header h-76 px-64': expanded,
              }"
            >
              <h2
                class="font-semibold text-heading"
                :class="{ 'flex-grow text-center ml-64': expanded }"
              >
                View the image below for this question
              </h2>

              <Button
                class="shrink-0"
                :autofocus="expanded"
                @click="expanded = !expanded"
              >
                {{ expanded ? 'Minimize' : 'Expand' }}
              </Button>
            </div>

            <div class="h-full grid py-10">
              <div
                class="my-auto lg:transition-all"
                :class="{
                  'aspect-w-16 aspect-h-9': !expanded,
                  'aspect-w-16 aspect-h-6': expanded,
                }"
              >
                <img
                  :src="imgSrc"
                  class="mx-auto object-contain min-w-full max-w-[fit-content] rounded border border-divider"
                />
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </template>

    <template #right>
      <PageTransition>
        <div
          :key="$route.fullPath"
          class="flex justify-center mt-198 h-full w-full"
        >
          <InputField />
        </div>
      </PageTransition>
    </template>
  </TwoToneBg>
</template>
