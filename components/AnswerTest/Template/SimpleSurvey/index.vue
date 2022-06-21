<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import BlankPage from '../BlankPage/index.vue'
import InputField from '../../InputField/index.vue'
import AnswerTestPageTransition from '~/components/Base/AnswerTestPageTransition/index.vue'

export default defineComponent({
  name: 'AnswerTestTemplateSimpleSurvey',
  components: { BlankPage, InputField, AnswerTestPageTransition },
})
</script>

<template>
  <AnswerTestPageTransition>
    <BlankPage :key="$route.fullPath">
      <InputField />
    </BlankPage>
  </AnswerTestPageTransition>
</template>
