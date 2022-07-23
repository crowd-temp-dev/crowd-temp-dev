<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import Section from '../Section/index.vue'
import FollowUpQuestion from '../FollowUpQuestion/index.vue'
import project from '~/mixins/project'

export default defineComponent({
  name: 'AppProjectStepsSimpleSurvey',
  components: { Section, FollowUpQuestion },
  mixins: [project],
})
</script>

<template>
  <Section
    :id="id"
    v-slot="{fieldIdAndError}"
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
      :id-and-error="fieldIdAndError"
    />
  </Section>
</template>
