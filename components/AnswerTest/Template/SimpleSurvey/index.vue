<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import BlankPage from '../BlankPage/index.vue'
import InputField from '../../InputField/index.vue'

export default defineComponent({
  name: 'AnswerTestTemplateSimpleSurvey',
  components: { BlankPage, InputField },
})
</script>

<template>
  <BlankPage> 
    <InputField />
  </BlankPage>
</template>
