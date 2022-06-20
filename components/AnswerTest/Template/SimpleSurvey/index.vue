<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import BlankPage from '../BlankPage/index.vue'
import InputField from '../../InputField/index.vue'
import PageTransition from '../../PageTransition/index.vue'

export default defineComponent({
  name: 'AnswerTestTemplateSimpleSurvey',
  components: { BlankPage, InputField, PageTransition },
})
</script>

<template>
  <PageTransition>
    <BlankPage :key="$route.fullPath">
      <InputField />
    </BlankPage>
  </PageTransition>
</template>
