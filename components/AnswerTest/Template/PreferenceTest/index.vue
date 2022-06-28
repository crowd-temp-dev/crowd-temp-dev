<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api'
import BlankPage from '../BlankPage/index.vue'
import InputField from '../../InputField/index.vue'
import Item from './Item/index.vue'
import AnswerTestPageTransition from '~/components/Base/AnswerTestPageTransition/index.vue'
import { oneFrame, sleep } from '~/utils'

export default defineComponent({
  name: 'AnswerTestTemplatePreferenceTest',
  components: {
    BlankPage,
    InputField,
    AnswerTestPageTransition,
    Item,
  },
  setup(_, { root }) {
    const selected = ref<number>()

    const addTitleShake = ref(false)

    const noneSelected = computed(() => selected.value === undefined)

    const shakeTitle = async (evt: PointerEvent) => {
      if (evt.target === evt.currentTarget) {
        const main = document.querySelector('main')

        if (main) {
          main.scrollTo({
            top: 0,
            behavior: 'smooth',
          })

          if (main.scrollTop > 32) {
            await sleep(oneFrame * 5)
          }
        }

        addTitleShake.value = false

        await sleep(oneFrame)

        addTitleShake.value = true
      }
    }

    const questionIndex = computed(() =>
      parseFloat(root.$route.params.question)
    )

    const currentSection = computed(() => {
      return (
        root.$store.state['answer-test'].form[
          `question-${questionIndex.value}`
        ] || {}
      )
    })

    const files = computed(() => currentSection.value.files || [])

    const selectedFile = computed(() => {
      const file = files.value[selected.value]

      return file
        ? [
            {
              file,
              index: files.value.indexOf(file),
            },
          ]
        : undefined
    })

    return {
      selected,
      noneSelected,
      addTitleShake,
      currentSection,
      files,
      selectedFile,
      shakeTitle,
    }
  },
})
</script>

<template>
  <AnswerTestPageTransition>
    <BlankPage class="!mt-[4rem]">
      <div class="grid grid-cols-2 gap-x-38 w-full max-w-[1400px] px-[1rem]">
        <div class="my-auto pb-64">
          <h2
            class="font-semibold mb-10"
            :class="{ 'shake-anim': addTitleShake }"
          >
            Select your preferred version
          </h2>

          <div class="grid grid-cols-2 grid-rows-2 gap-20">
            <Item
              v-for="(src, i) in files"
              :key="src"
              :index="i + 1"
              :src="src"
              :active="selected === i"
              @on-select="selected = i"
            />
          </div>
        </div>

        <AnswerTestPageTransition>
          <div
            :key="$route.fullPath"
            class="mt-198 w-fit h-fit sticky top-[calc(198px+4rem)]"
            v-on="
              noneSelected
                ? {
                    click: shakeTitle,
                  }
                : {}
            "
          >
            <InputField
              :readonly="noneSelected"
              :class="{ 'pointer-events-none': noneSelected }"
              :append-values="selectedFile"
            />
          </div>
        </AnswerTestPageTransition>
      </div>
    </BlankPage>
  </AnswerTestPageTransition>
</template>
