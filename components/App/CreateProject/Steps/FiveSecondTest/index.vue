<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import Section from '../Section/index.vue'
import FollowUpQuestion from '../FollowUpQuestion/index.vue'
import Select from '~/components/Base/Select/index.vue'
import project from '~/mixins/project'
import { fiveSecondTestDurations } from '~/utils'

export default defineComponent({
  name: 'AppProjectStepsFiveSecondTest',
  components: { Section, Select, FollowUpQuestion },
  mixins: [project],
  setup() {
    const delayOptions = fiveSecondTestDurations.map((milliseconds) => {
      const isMinute = Number(milliseconds) >= 60000

      const getMinute = Math.round(Number(milliseconds) / 60000)

      const seconds = Number(milliseconds) / 1000

      return {
        label: `${isMinute ? getMinute : seconds} ${
          isMinute ? `minute${getMinute > 1 ? 's' : ''}` : 'seconds'
        }`,
        value: String(milliseconds),
      }
    })

    return {
      delayOptions,
    }
  },
})
</script>

<template>
  <Section
    :id="id"
    v-slot="{ fieldIdAndError }"
    :title="`${rootNumber}. Five second test`"
    :store-index="rootNumber"
  >
    <p class="mb-20">
      Participants are shown an image for a short time before answering
      questions
    </p>

    <div class="mb-16 flex items-center justify-between">
      <Select
        v-model="state.duration"
        label="Media files will show for only"
        :options="delayOptions"
        required
        mandatory
        bold-label
      />
    </div>

    <DropZone
      v-model="state.file"
      action-hint="or drop files to upload (JPG, JPEG, PNG, GIF, MP4 or MPEG supported
Max file size 5MB for images and 100MB for video/audio"
      required
      max-size="100mb"
      accept="image/*,video/*,audio/*"
    />

    <FollowUpQuestion
      v-model="state.followUpQuestions"
      :question-id="state.id"
      :root-number="rootNumber"
      :id-and-error="fieldIdAndError"
    />
  </Section>
</template>
