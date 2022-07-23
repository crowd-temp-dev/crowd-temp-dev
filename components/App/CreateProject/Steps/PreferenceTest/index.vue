<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import Section from '../Section/index.vue'
import FollowUpQuestion from '../FollowUpQuestion/index.vue'
import project from '~/mixins/project'

export default defineComponent({
  name: 'AppProjectStepsPreferenceTest',
  components: { Section, FollowUpQuestion },
  mixins: [project],
})
</script>

<template>
  <Section
    :id="id"
    v-slot="{ fieldIdAndError }"
    :title="`${rootNumber}. Preference Test`"
    :store-index="rootNumber"
  >
    <p class="mb-20">
      Quickly validate different up to 4 versions of your idea with users. Add
      at least 2 versions per question.
    </p>

    <div class="grid grid-cols-2 gap-16 xl:gap-24">
      <DropZone
        v-for="index in 4"
        :key="index"
        v-model="state.files[index - 1]"
        :action-title="index > 2 ? 'Add file (optional)' : 'Add file'"
        :valid-image-types="['image/gif', 'image/jpeg', 'image/png']"
        :required="index < 3"
        accept="image/*"
        max-size="5mb"
      />
    </div>

    <FollowUpQuestion
      v-model="state.followUpQuestions"
      :question-id="state.id"
      :root-number="rootNumber"
      :id-and-error="fieldIdAndError"
    />
  </Section>
</template>
