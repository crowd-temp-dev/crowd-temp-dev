<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import Section from '../Section/index.vue'
import FollowUpQuestion from '../FollowUpQuestion/index.vue'
import createTest from '~/mixins/createTest'

export default defineComponent({
  name: 'AppCreateTestStepsPrototypeEvaluation',
  components: { Section, FollowUpQuestion },
  mixins: [createTest],
  setup() {
    const selectedFileType = ref('')

    const delayOptions = [{ label: '5 seconds', value: '5' }]

    const selectedFrameType = ref('')

    const frameTypes = [{ label: 'No frame', value: 'no-frame' }]

    return {
      delayOptions,
      selectedFileType,
      selectedFrameType,
      frameTypes,
    }
  },
})
</script>

<template>
  <Section
    :id="id"
    :title="`${rootNumber}. Prototype evaluation`"
    :store-index="rootNumber"
  >
    <p class="mb-20">
      Input your figma prototype, set tasks for participants to complete and add
      questions
    </p>

    <PFormLayout class="my-0">
      <div>
        <TextField v-model="state.websiteLink" label="Website link" required />

        <p class="text-text-subdued mt-4">
          Copy the share link from your Figma file, be sure to enable “Anyone
          can view with link”. We recommend duplicating the flow you're testing
          in a separate Figma file.
          <NuxtLink class="text-action-primary-default hover:underline" to="#"
            >Learn more</NuxtLink
          >
        </p>
      </div>

      <TextField
        v-model="state.task"
        label="Task (Optional)"
        help-text="What task would you like people to complete on this prototype"
      />
    </PFormLayout>

    <FollowUpQuestion
      v-model="state.followUpQuestions"
      :question-id="state.id"
      :root-number="rootNumber"
    />
  </Section>
</template>
