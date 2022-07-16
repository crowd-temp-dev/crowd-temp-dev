<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api'
import Section from '../Section/index.vue'
import { TestSuiteState } from '~/store/testSuite'

export default defineComponent({
  name: 'AppCreateTestStepsThankYouScreen',
  components: { Section },
  setup(_, { root: { $store } }) {
    const modelSync = computed(() => {
      const storeValue = ($store.state.testSuite as TestSuiteState).create
        .thankYouScreen

      return new Proxy(
        {},
        {
          get(_, path: keyof typeof storeValue) {
            return storeValue[path] || ''
          },
          set(_, path: keyof typeof storeValue, value: any) {
            $store.commit('testSuite/create/thankYouScreen/setData', {
              [path]: value,
            })

            return true
          },
        }
      )
    })

    return { modelSync }
  },
})
</script>

<template>
  <Id id="create-test-thank-you-screen" v-slot="{ id }">
    <Section
      :id="id"
      v-slot="{ fieldIdAndError }"
      title="Thank you screen"
      hide-add-new-block
      is-static
    >
      <h4 class="text-subdued mb-20">
        This is the Thank you screen your testers see when the test has been
        completed . Leave empty to use default thank you message.
      </h4>

      <div class="grid gap-y-20">
        <TextField
          v-bind="fieldIdAndError(`${id}-title`)"
          label="Title"
          show-character-count
          :max-length="20"
          :model-value="modelSync.title"
          @update:modelValue="(e) => (modelSync.title = e)"
        />

        <TextField
          v-bind="fieldIdAndError(`${id}-message`)"
          label="Your message"
          multiline
          :model-value="modelSync.message"
          @update:modelValue="(e) => (modelSync.message = e)"
        />
      </div>
    </Section>
  </Id>
</template>
