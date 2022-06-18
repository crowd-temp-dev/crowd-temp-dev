<template>
  <Section
    id="create-test-thank-you-screen"
    title="Thank you screen"
    hide-add-new-block
    is-static
  >
    <h4 class="text-subdued">
      This is the Thank you screen your testers see when the test has been
      completed . Leave empty to use default thank you message.
    </h4>

    <Form
      v-slot="{ setup }"
      class="mt-20"
      name="thankYouScreen"
      :initial-value="{
        title: '',
        message: '',
      }"
    >
      <TextField
        v-bind="setup('title')"
        label="Title"
        show-character-count
        :max-length="20"
      />
      <TextField
        v-bind="setup('message')"
        label="Your message"
        multiline
      />
    </Form>
  </Section>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import Section from '../Section/index.vue'
import Form from '../Form/index.vue'

export default defineComponent({
  name: 'AppCreateTestStepsThankYouScreen',
  components: { Section, Form },
})
</script>

<style scoped></style>
