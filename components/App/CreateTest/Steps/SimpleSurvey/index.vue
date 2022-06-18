<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import Section from '../Section/index.vue'
import FollowUpQuestion from '../FollowUpQuestion/index.vue'
import createTest from '~/mixins/createTest'

export default defineComponent({
  name: 'AppCreateTestStepsSimpleSurvey',
  components: { Section, FollowUpQuestion },
  mixins: [createTest],
})
</script>

<template>
  <Section
    :id="id"
    :title="`${rootNumber}. Simple survey`"
    :store-index="rootNumber"
  >
    <p class="mb-20 text-text-subdued">Add your questions below</p>

    <FollowUpQuestion
      v-model="state.followUpQuestions"
      hide-title
      :question-id="state.id"
      :root-number="rootNumber"
      :min-length="1"
    />
  </Section>
</template>
