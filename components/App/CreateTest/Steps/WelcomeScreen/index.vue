<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api'
import Section from '../Section/index.vue'
import { TestSuiteState } from '~/store/testSuite'

export default defineComponent({
  name: 'AppCreateTestStepsWelcomeScreen',
  components: { Section },
  emits: ['on-update'],
  setup(_, { root: { $store } }) {
    const modelSync = computed(() => {
      const storeValue = ($store.state.testSuite as TestSuiteState).create
        .welcomeScreen

      return new Proxy(
        {},
        {
          get(_, path: keyof typeof storeValue) {
            return storeValue[path] || ''
          },
          set(_, path: keyof typeof storeValue, value: any) {
            $store.commit('testSuite/create/welcomeScreen/setData', {
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
  <Id id="create-test-welcome-screen" v-slot="{ id }">
    <Section
      :id="id"
      v-slot="{ fieldIdAndError }"
      title="Welcome Screen"
      hide-add-new-block
      is-static
    >
      <h4 class="text-text-subdued mb-20">
        This is the welcome screen your testers first see. You can also add
        extra instructions here. Leave empty to use default welcome message.
      </h4>

      <div class="grid gap-y-20">
        <TextField
          label="Title"
          type="text"
          show-character-count
          :max-length="20"
          required
          pattern=".{0,20}"
          v-bind="fieldIdAndError(`${id}-title`)"
          :model-value="modelSync.title"
          @update:modelValue="(e) => (modelSync.title = e)"
        />
        <TextField
          label="Your message or instructions"
          multiline
          :min-height="73"
          required
          v-bind="fieldIdAndError(`${id}-message`)"
          :model-value="modelSync.message"
          @update:modelValue="(e) => (modelSync.message = e)"
        />

        <TextField
          label="Start button text"
          type="text"
          show-character-count
          :max-length="20"
          help-text="What should the start button say"
          required
          v-bind="fieldIdAndError(`${id}-button-text`)"
          :model-value="modelSync.buttonText"
          @update:modelValue="(e) => (modelSync.buttonText = e)"
        />
      </div>

      <button type="submit" class="sr-only" form="welcome-screen">
        Submit
      </button>
    </Section>
  </Id>
</template>
