<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api'
import { QuestionModelValue } from '../type'
import { uid } from '~/utils'

export default defineComponent({
  name: 'AppProjectFollowUpQuestionsQuestionLinearScale',
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  props: {
    modelValue: {
      type: Object as () => QuestionModelValue['linearScale'],
      required: true,
    },
  },
  setup(_props, { emit }) {
    const fields = ref([
      {
        label: 'Start value',
        id: uid(),
      },
      {
        label: 'End value',
        id: uid(),
      },
      {
        label: 'Type',
        id: uid(),
      },
    ])

    const modelSync = computed({
      get() {
        return _props.modelValue
      },
      set(val: QuestionModelValue['linearScale']) {
        emit('update:modelValue', val)
      },
    })

    const startValues = computed(() => {
      return Array.from(
        { length: Number(modelSync.value.end.value) - 2 },
        (_, i) => ({
          label: `${i + 1}`,
          value: `${i + 1}`,
        })
      )
    })

    const endValues = computed(() => {
      return Array.from(
        { length: 9 - Number(modelSync.value.start.value) },
        (_, i) => ({
          label: `${i + 2 + Number(modelSync.value.start.value)}`,
          value: `${i + 2 + Number(modelSync.value.start.value)}`,
        })
      )
    })

    return { fields, startValues, endValues, modelSync }
  },
})
</script>

<template>
  <div class="mt-32 flex">
    <div class="grid gap-y-6 mr-8 shrink-0">
      <span
        v-for="field in fields"
        :key="field.id"
        class="inline-flex items-center h-36"
      >
        <label
          :for="field.id"
          class="text-text-subdued uppercase text-sub-heading font-semibold cursor-pointer"
        >
          {{ field.label }}
        </label>
      </span>
    </div>

    <div class="grid gap-y-6 grow">
      <div class="flex space-x-10 w-full">
        <Select
          :id="fields[0].id"
          v-model="modelSync.start.value"
          :options="startValues"
          mandatory
          class="min-w-[64px]"
          required
        />

        <TextField
          v-model="modelSync.start.label"
          placeholder="Start label (optional)"
          class="grow"
        />
      </div>

      <div class="flex space-x-10 w-full">
        <Select
          :id="fields[1].id"
          v-model="modelSync.end.value"
          :options="endValues"
          mandatory
          class="min-w-[64px]"
          required
        />

        <TextField
          v-model="modelSync.end.label"
          placeholder="End label (optional)"
          class="grow"
        />
      </div>

      <Select
        :id="fields[2].id"
        v-model="modelSync.type"
        :options="[
          { label: 'Numbers', value: 'number' },
          { label: 'Stars', value: 'star' },
        ]"
        mandatory
        required
        class="w-fit"
      />
    </div>
  </div>
</template>
