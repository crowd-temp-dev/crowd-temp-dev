<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import Section from '../Section/index.vue'
import Id from '~/components/Base/Id/index.vue'
import { TestSuiteState } from '~/store/testSuite'

export default defineComponent({
  name: 'AppCreateTestStepsTestDetails',
  components: { Section, Id },
  setup(_, { root: { $store } }) {
    const modelSync = computed(() => {
      const storeValue = ($store.state.testSuite as TestSuiteState).detail

      return new Proxy(
        {},
        {
          get(_, path: keyof typeof storeValue) {
            return storeValue[path] || ''
          },
          set(_, path: keyof typeof storeValue, value: any) {
            $store.commit('testSuite/detail/setData', {
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
  <Id id="create-test-test-detail" v-slot="{ id }">
    <Section
      :id="id"
      v-slot="{ fieldIdAndError }"
      title="Test Details"
      hide-add-new-block
      is-static
    >
      <div class="grid gap-y-20">
        <TextField
          v-bind="fieldIdAndError(`${id}-name`)"
          label="Test name"
          placeholder="New Test"
          required
          :model-value="modelSync.name"
          @update:modelValue="(e) => (modelSync.name = e)"
        />

        <TextField
          v-bind="fieldIdAndError(`${id}-description`)"
          label="Description"
          help-text="Enter a short description of your test"
          required
          :model-value="modelSync.description"
          @update:modelValue="(e) => (modelSync.description = e)"
        />
      </div>
    </Section>
  </Id>
</template>
