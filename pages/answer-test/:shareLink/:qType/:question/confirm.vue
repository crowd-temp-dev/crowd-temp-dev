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
        <h2 class="font-semibold text-[28px] leading-[24px] mb-20">
          <strong> {{ confirmDetails.title }} </strong>
        </h2>

        <p class="mb-24">
          {{ confirmDetails.subtitle }}
        </p>

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
