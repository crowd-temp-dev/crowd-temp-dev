<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import Section from '../Section/index.vue'
import Id from '~/components/Base/Id/index.vue'
import { TestSuiteState } from '~/store/projectSuite'
import RadioGroup from '~/components/Base/RadioGroup/index.vue'

export default defineComponent({
  name: 'AppProjectStepsTestDetails',
  components: { Section, Id, RadioGroup },
  setup(_, { root: { $store } }) {
    const modelSync = computed(() => {
      const storeValue = ($store.state.projectSuite as TestSuiteState).detail

      return new Proxy(
        {},
        {
          get(_, path: keyof typeof storeValue) {
            return storeValue[path] || ''
          },
          set(_, path: keyof typeof storeValue, value: any) {
            $store.commit('projectSuite/detail/setData', {
              [path]: value,
            })

            return true
          },
        }
      )
    })

    const deviceTypes = ['All devices', 'Desktop only', 'Mobile only']

    return { modelSync, deviceTypes }
  },
})
</script>

<template>
  <Id id="project-test-detail" v-slot="{ id }">
    <Section
      :id="id"
      v-slot="{ fieldIdAndError }"
      title="Project Details"
      hide-add-new-test
      is-static
    >
      <div class="grid gap-y-20">
        <TextField
          v-bind="fieldIdAndError(`${id}-name`)"
          label="Project name"
          placeholder="New Project"
          required
          :model-value="modelSync.name"
          @update:modelValue="(e) => (modelSync.name = e)"
        />

        <TextField
          v-bind="fieldIdAndError(`${id}-description`)"
          label="Description"
          help-text="Enter a short description of your project"
          required
          :model-value="modelSync.description"
          @update:modelValue="(e) => (modelSync.description = e)"
        />

        <RadioGroup v-bind="fieldIdAndError(`${id}-deviceType`)" required>
          <p class="mb-10">Allow test participation on</p>

          <div class="grid justify-start gap-12 grid-flow-col">
            <Radio
              v-for="(item, i) in deviceTypes"
              :key="i"
              :label="item"
              name="deviceType"
              :value="item"
            />
          </div>
        </RadioGroup>
      </div>
    </Section>
  </Id>
</template>
