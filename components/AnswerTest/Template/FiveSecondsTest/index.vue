<script lang="ts">
import { computed, defineComponent, nextTick, ref } from '@vue/composition-api'
import InputField from '../../InputField/index.vue'
import BlankPage from '../BlankPage/index.vue'
import AnswerTestPageTransition from '~/components/Base/AnswerTestPageTransition/index.vue'
import Button from '~/components/Base/Button/index.vue'
import Countdown from '~/utils/countdown'
import { sleep } from '~/utils'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'
import Spinner from '~/components/Base/Spinner/index.vue'

export default defineComponent({
  name: 'AnswerTestTemplateDesignSurvey',
  components: {
    InputField,
    AnswerTestPageTransition,
    Button,
    FadeTransition,
    Spinner,
    BlankPage,
  },
  setup(_, { root }) {
    const expanded = ref(false)

    const viewImage = ref(false)

    const countdownTime = ref('')

    const countdownDone = computed(() => countdownTime.value === '0:00')

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

    const imgSrc = computed(() =>
      currentSection.value.file ? `/file/${currentSection.value.file}` : ''
    )

    const formatDuration = computed(() => {
      if (notConfirmed.value) {
        const milliseconds = Number(currentSection.value.duration)

        const isMinute = milliseconds >= 60000

        const getMinute = milliseconds / 60000

        const seconds = milliseconds / 1000

        return `${isMinute ? getMinute : seconds} ${
          isMinute ? `minute${getMinute > 1 ? 's' : ''}` : 'seconds'
        }`
      }

      return ''
    })

    const timeFormatter = Intl.DateTimeFormat('en', {
      minute: 'numeric',
      second: '2-digit',
    })

    const startCountdown = () => {
      const countdown = new Countdown({
        duration: currentSection.value.duration,
        onDone: () => {
          countdownTime.value = '0:00'

          root.$store.dispatch('answer-test/confirmSection')
        },
        onUpdate: (val) => {
          countdownTime.value = timeFormatter
            .format(val.remainingTime)
            .replace(/^00/, '0')
        },
      })

      sleep(1000).then(() => countdown.start())
    }

    const showImage = async () => {
      countdownTime.value = timeFormatter
        .format(currentSection.value.duration)
        .replace(/^00/, '0')

      await nextTick()

      viewImage.value = true
    }

    return {
      expanded,
      currentSection,
      imgSrc,
      notConfirmed,
      viewImage,
      questionIndexAndLetter,
      formatDuration,
      countdownTime,
      countdownDone,
      startCountdown,
      showImage,
    }
  },
})
</script>

<template>
  <AnswerTestPageTransition>
    <div v-if="notConfirmed" class="flex relative isolate h-full w-full">
      <div
        class="mt-[5%] flex w-full transition-[opacity,transform] transform-gpu"
        :class="{ 'opacity-0 scale-[0.95]': viewImage }"
      >
        <PEmptyState class="max-w-[760px] mx-auto w-full h-fit">
          <div class="grid justify-items-center justify-center">
            <img
              src="/png/app/Home/test-list/empty-state.png"
              class="mb-32 h-172"
            />

            <p
              class="font-sf-pro-display text-display-small text-text-default mb-8"
            >
              Question {{ questionIndexAndLetter }} image
            </p>

            <p class="text-text-default">
              <strong>
                The image you're about to view will last
                {{ formatDuration }}.
              </strong>
            </p>

            <p class="mb-16">Pay attention and answer the follow-up question</p>

            <Button primary @click="showImage"> View image </Button>
          </div>
        </PEmptyState>
      </div>

      <template v-if="viewImage">
        <FadeTransition>
          <div v-if="!countdownDone" class="absolute w-full h-full inset-0">
            <div
              class="image-header flex-centered h-76 w-full absolute top-0 z-10 bg-surface-default shadow-divide-header"
            >
              <strong class="font-sf-pro-display countdown-time">
                The image below will disappear in {{ countdownTime }} seconds
              </strong>
            </div>

            <div
              class="fade-appear w-full h-full bg-sky-light absolute inset-0 pt-76"
              style="--appear-duration: 350ms"
            >
              <div class="h-full mt-[2%]">
                <div class="aspect-w-16 aspect-h-6 drop-shadow-sm">
                  <img
                    :src="imgSrc"
                    class="object-contain"
                    onload="startCountdown"
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            v-else
            class="w-full h-full flex-centered bg-sky-light absolute text-display-large text-text-subdued"
          >
            <Spinner />
          </div>
        </FadeTransition>
      </template>
    </div>

    <BlankPage :key="$route.fullPath">
      <InputField />
    </BlankPage>
  </AnswerTestPageTransition>
</template>

<style scoped>
.image-header {
  animation: image-header 250ms cubic-bezier(0.075, 0.82, 0.165, 1);
}

@keyframes image-header {
  from {
    opacity: 0;
    transform: translate3d(0, -100%, 0);
  }
}

.countdown-time {
  font-variant-numeric: tabular-nums;
}
</style>
