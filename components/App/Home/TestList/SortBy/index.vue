<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import Dropdown from '../../../../Base/Dropdown/index.vue'
import type { DropdownOption } from '~/components/Base/Dropdown/index.vue'

export default defineComponent({
  name: 'AppHomeTestListSortBy',
  components: { Dropdown },
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  props: {
    modelValue: {
      type: Number,
      required: true,
    },
  },
  setup(_props, { emit }) {
    const modelSync = computed({
      get() {
        return _props.modelValue
      },
      set(val: number) {
        emit('update:modelValue', val)
      },
    })
    const options = computed<DropdownOption[]>(() => {
      return [
        'New to Oldest',
        'Oldest to New',
        'By name (A-Z)',
        'By name (Z-A)',
      ].map((x, i) => ({
        title: x,
        onClick: () => {
          modelSync.value = i
        },
        ...(modelSync.value === i
          ? {
              class: 'font-semibold',
              selected: true,
            }
          : {}),
      }))
    })
    return { modelSync, options }
  },
})
</script>

<template>
  <Dropdown
    v-slot="{ events, active }"
    :option="options"
    placement="bottom-end"
    :offset="[0, 4]"
    content-class="min-w-[156px]"
  >
    <Button
      :disclosure="active ? 'up' : 'down'"
      class="show-ring"
      v-on="events"
    >
      Sort
    </Button>
  </Dropdown>
</template>
