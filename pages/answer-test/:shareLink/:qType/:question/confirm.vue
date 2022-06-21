<script lang="ts">
import { defineComponent, computed, ref } from '@vue/composition-api'
import { Layout, CreateTestComponent } from '~/types'
import Button from '~/components/Base/Button/index.vue'
import TwoToneBg from '~/components/AnswerTest/TwoToneBg/index.vue'
import answerTest from '~/mixins/answerTest'

const details = {
  SimpleSurvey: {
    title: '❔ Simple survey',
    subtitle:
      "For this section you'd be shown you'd be asked a couple of questions, answer as honest as you can",
  },
  DesignSurvey: {
    title: '🎨Design Survey',
    subtitle:
      "For this section you'd be asked a couple of questions, some of this questions might have media files (image, video or audio) attached which will show on the left section of your view. To get started click on <strong>“continue”</strong>.",
  },
  FiveSecondsTest: {
    title: '⏳Five Second Test',
    subtitle:
      "For this section you'd be shown an image for a specified duration in seconds, kindly pay attention to the image and answer the follow-up questions.",
  },
} as Record<
  CreateTestComponent,
  {
    title: string
    subtitle: string
  }
>

export default defineComponent({
  name: 'AnswerTestQuestionConfirmPage',
  components: { Button, TwoToneBg },
  mixins: [answerTest],
  layout: 'answer-test' as Layout,
  transition: 'answer-page-transition',

  setup(_, { root }) {
    const confirming = ref(false)

    const confirmDetails = computed(() => {
      return details[root.$route.params.qType as CreateTestComponent]
    })

    const confirm = () => {
      root.$store.dispatch('answer-test/confirmSection')
    }

    return { confirmDetails, confirming, confirm }
  },
  head: {
    title: 'Faux title!!!',
    meta: [
      {
        hid: 'description',
        name: 'descrition',
        content: 'Answer tests. Design survey',
      },
    ],
  },
})
</script>

<template>
  <div class="h-full">
    <TwoToneBg
      :loading="loading"
      right-pane-class="fade-appear pl-48 xl:pl-64 pt-144 xl:pt-198 pr-32 xl:pr-64"
    >
      <template #right>
        <h2
          class="font-semibold text-[28px] leading-[24px] mb-20 font-sf-pro-display"
        >
          <strong> {{ confirmDetails.title }} </strong>
        </h2>

        <!-- eslint-disable-next-line vue/no-v-html -->
        <p class="mb-24" v-html="confirmDetails.subtitle" />

        <div class="flex items-center space-x-12">
          <Button primary :loading="confirming" @click="confirm">
            Confirm
          </Button>
        </div>
      </template>
    </TwoToneBg>
  </div>
</template>

<style lang="postcss"></style>
