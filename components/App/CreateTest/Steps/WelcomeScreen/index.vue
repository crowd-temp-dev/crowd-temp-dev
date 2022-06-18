<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import Section from '../Section/index.vue'
import Form from '../Form/index.vue'

export default defineComponent({
  name: 'AppCreateTestStepsWelcomeScreen',
  components: { Section, Form },
  emits: ['on-update'],
})
</script>

<template>
  <Section
    id="create-test-welcome-screen"
    title="Welcome Screen"
    hide-add-new-block
    is-static
  >
    <h4 class="text-text-subdued mb-20">
      This is the welcome screen your testers first see. You can also add extra
      instructions here. Leave empty to use default welcome message.
    </h4>

    <Form
      v-slot="{ setup }"
      class="mt-0"
      name="welcomeScreen"
      :initial-value="{
        title: '',
        message: '',
        buttonText: '',
      }"
    >
      <TextField
        v-bind="setup('title')"
        label="Title"
        type="text"
        show-character-count
        :max-length="20"
        required
        pattern=".{0,20}"
      />
      <TextField
        v-bind="setup('message')"
        label="Your message or instructions"
        multiline
        :min-height="73"
        required
      />

      <TextField
        v-bind="setup('buttonText')"
        label="Start button text"
        type="text"
        show-character-count
        :max-length="20"
        help-text="What should the start button say"
        required
      />
    </Form>

    <button type="submit" class="sr-only" form="welcome-screen">Submit</button>
  </Section>
</template>
