<template>
  <div class="h-full">
    <WelcomePage title="🎨Design Survey">
      <template #subtitle>
        For this section you'd be asked a couple of questions, some of this
        questions might have media files (image, video or audio) attached which
        will show on the left section of your view. To get started click on
        <strong>“continue”</strong>.
      </template>

      <template #cta>
        <Button primary to="/answer-test/design-survey/question/1">
          Continue
        </Button>
      </template>
    </WelcomePage>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { Layout } from '~/types'
import WelcomePage from '@/components/AnswerTest/WelcomePage/index.vue'
import Button from '~/components/Base/Button/index.vue'

export default defineComponent({
  name: 'AppSettingsBillingPage',
  components: { WelcomePage, Button },
  layout: 'answer-test' as Layout,
  transition: 'page-fade-transition',
  setup() {},

  head: {
    title: 'Design survey - Answer tests',
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

<style lang="postcss"></style>
