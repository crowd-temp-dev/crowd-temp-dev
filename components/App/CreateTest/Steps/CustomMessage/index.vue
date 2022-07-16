<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import Section from '../Section/index.vue'
import createTest from '~/mixins/createTest'

export default defineComponent({
  name: 'AppCreateTestStepsCustomMessage',
  components: { Section },
  mixins: [createTest],
})
</script>

<template>
  <Section
    :id="id"
    v-slot="{ fieldIdAndError }"
    :title="`${rootNumber}. Custom message`"
    :store-index="rootNumber"
  >
    <p class="text-text-subdued mb-20">
      Want to add special instructions before a test type? Add it here
    </p>

    <div class="grid gap-y-20">
      <TextField
        v-model="state.title"
        label="Title"
        required
        v-bind="fieldIdAndError(`${state.id}-title`)"
      />

      <TextField
        v-model="state.message"
        multiline
        label="Your message or instructions"
        :min-height="72"
        required
        v-bind="fieldIdAndError(`${state.id}-message`)"
      />
    </div>
  </Section>
</template>
