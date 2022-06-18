<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import Section from '../Section/index.vue'
import FollowUpQuestion from '../FollowUpQuestion/index.vue'
import createTest from '~/mixins/createTest'

export default defineComponent({
  name: 'AppCreateTestStepsWebsiteEvaluation',
  components: { Section, FollowUpQuestion },
  mixins: [createTest],
})
</script>

<template>
  <Section
    :id="id"
    :title="`${rootNumber}. Website evaluation`"
    :store-index="rootNumber"
  >
    <p class="mb-20">
      Add you website link, set tasks for participants to complete and add
      questions
    </p>

    <div class="grid gap-y-20 mt-0 mb-20">
      <div>
        <TextField v-model="state.websiteLink" label="Website link" required />

        <p class="text-text-subdued mt-4">
          Copy the share link from your Figma file, be sure to enable “Anyone
          can view with link”. We recommend duplicating the flow you're testing
          in a separate Figma file. <NuxtLink class="text-action-primary-default hover:underline" to="#">Learn more</NuxtLink>
        </p>
      </div>

      <TextField
        v-model="state.task"
        label="Task (Optional)"
        help-text="What task would you like people to complete on this prototype"
      />
    </div>

    <FollowUpQuestion
      v-model="state.followUpQuestions"
      :question-id="state.id"
      :root-number="rootNumber"
    />
  </Section>
</template>
