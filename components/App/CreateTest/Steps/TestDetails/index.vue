<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import Form from '../Form/index.vue'
import Section from '../Section/index.vue'
import { CreateTestState } from '~/store/create-test'

export default defineComponent({
  name: 'AppCreateTestStepsTestDetails',
  components: { Section, Form },
  setup(_, { root: { $store } }) {
    const testTitle = computed({
      get() {
        return ($store.state['create-test'] as CreateTestState).form.testDetails
          .name
      },
      set(val: string) {
        if (typeof val === 'string') {
          $store.dispatch('create-test/updateForm', {
            path: 'testDetails.name',
            value: val,
          })
        }
      },
    })

    return { testTitle }
  },
})
</script>

<template>
  <Section
    id="create-test-test-detail"
    title="Test Details"
    hide-add-new-block
    is-static
  >
    <Form
      v-slot="{ setup }"
      class="mt-0"
      name="testDetails"
      :initial-value="{
        name: 'New test',
        description: '',
      }"
    >
      <TextField
        v-bind="setup('name')"
        label="Test name"
        placeholder="New Test"
        required
      />
      <TextField
        v-bind="setup('description')"
        label="Description"
        help-text="Enter a short description of your test"
        required
      />
    </Form>
  </Section>
</template>
