<template>
  <Section
    :id="id"
    :title="`${rootNumber}. Click test`"
    :store-index="rootNumber"
  >
    <p class="mb-20">
      Ask participants where they would click to perform a task.
    </p>

    <div class="mb-16 flex items-center justify-between">
      <Select
        v-model="selectedFileType"
        label="File type"
        :options="fileTypes"
      />

      <Select
        v-model="selectedFrameType"
        label="Frame type"
        :options="frameTypes"
      />
    </div>

    <PDropZone
      type="file"
      :files="[]"
      action-hint="or drop files to upload (JPG, JPEG, PNG, GIF, MP4 or MPEG supported
Max file size 5MB for images and 100MB for video/audio0"
      :handle-on-drop="() => {}"
    />

    <TextField
      label="Task"
      help-text="Add an instruction for click test e.g where would you click to sign up"
      class="my-20"
    />

    <FollowUpQuestion :root-number="rootNumber" />
  </Section>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import Section from '../Section/index.vue'
import FollowUpQuestion from '../FollowUpQuestion/index.vue'
import Select from '~/components/Base/Select/index.vue'

export default defineComponent({
  name: 'AppProjectStepsClickTest',
  components: { Section, Select, FollowUpQuestion },
  props: {
    rootNumber: {
      type: Number,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
  },
  setup() {
    const selectedFileType = ref('')

    const fileTypes = [{ label: 'Image', value: 'img' }]

    const selectedFrameType = ref('')

    const frameTypes = [{ label: 'No frame', value: 'no-frame' }]

    return {
      fileTypes,
      selectedFileType,
      selectedFrameType,
      frameTypes,
    }
  },
})
</script>

<style scoped></style>
