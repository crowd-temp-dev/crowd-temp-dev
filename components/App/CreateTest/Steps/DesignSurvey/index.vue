<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import Section from '../Section/index.vue'
import FollowUpQuestion from '../FollowUpQuestion/index.vue'
import Select from '~/components/Base/Select/index.vue'
import createTest from '~/mixins/createTest'
import { DesignSurveyFileType, DesignSurveyFrameType } from '~/database/type'

interface SelectOption<Value> {
  label: string
  value: Value
}

export default defineComponent({
  name: 'AppCreateTestStepsDesignSurvey',
  components: { Section, Select, FollowUpQuestion },
  mixins: [createTest],
  setup() {
    const fileTypes: SelectOption<DesignSurveyFileType>[] = [
      {
        label: 'Image',
        value: 'image',
      },
      {
        label: 'Video',
        value: 'video',
      },
    ]

    const frameTypes: SelectOption<DesignSurveyFrameType>[] = [
      {
        label: 'No frame',
        value: 'no-frame',
      },
    ]

    return { fileTypes, frameTypes }
  },
})
</script>

<template>
  <Section
    :id="id"
    :title="`${rootNumber}. Design Survey`"
    :store-index="rootNumber"
  >
    <p class="text-text-subdued mb-20">Add your questions below</p>

    <div class="mb-16 flex items-center justify-between">
      <Select
        v-model="state.fileType"
        label="File type"
        :options="fileTypes"
        bold-label
        required
        mandatory
      />

      <Select
        v-model="state.frameType"
        bold-label
        label="Frame type"
        :options="frameTypes"
        required
        mandatory
      />
    </div>

    <DropZone
      v-model="state.file"
      type="file"
      action-hint="or drop files to upload (JPG, JPEG, PNG, GIF, MP4 or MPEG supported
Max file size 5MB for images and 100MB for video/audio"
      :accept="`${state.fileType}/*`"
      :max-size="state.fileType === 'image' ? '5mb' : '100mb'"
      required
    />

    <FollowUpQuestion
      v-model="state.followUpQuestions"
      :question-id="state.id"
      :root-number="rootNumber"
    />
  </Section>
</template>
