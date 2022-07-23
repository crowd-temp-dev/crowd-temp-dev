<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import { ProjectComponent, Layout } from '~/types'

export default defineComponent({
  name: 'AnswerTestDonePage',
  components: {},

  layout: 'answer-test' as Layout,

  transition: 'answer-done-page-transition',

  setup(_, { root }) {
    const template = computed(() => {
      return root.$route.params.qType as ProjectComponent
    })

    return { template }
  },

  head: {
    title: 'Test completed!',
    meta: [
      {
        hid: 'description',
        name: 'descrition',
        content: 'You have successfully answered this test',
      },
    ],
  },
})
</script>

<template>
  <div
    class="w-screen h-full bg-surface-default grid justify-center items-center content-center justify-items-center"
  >
    <h2 class="font-semibold font-sf-pro-display text-display-small">Thanks for taking the test!</h2>

    <p class="max-w-[720px] text-center mb-16 mt-8">
      We're constantly improving Crowd as a platform. Please click the button
      below to give feedback on your experience using Crowd. We want to hear
      from you!
    </p>

    <Button primary> Give feedback </Button>
  </div>
</template>
