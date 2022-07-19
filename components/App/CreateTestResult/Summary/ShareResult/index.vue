<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import Dropdown from '../../../../Base/Dropdown/index.vue'
import type { DropdownOption } from '~/components/Base/Dropdown/index.vue'

export default defineComponent({
  name: 'AppCreateTestResultSummaryShareResult',
  components: { Dropdown },
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  props: {},
  setup(_props) {
    const options = computed<DropdownOption[]>(() => {
      return [
        {
          title: 'Copy shareable URL',
          onClick: () => {},
        },
        {
          title: 'Export as CSV',
          onClick: () => {},
          disabled: true,
        },
        {
          title: 'Export as PDF',
          onClick: () => {},
          disabled: true,
        },
      ]
    })
    return { options }
  },
})
</script>

<template>
  <Dropdown
    v-slot="{ events, active }"
    :option="options"
    placement="bottom-start"
    :offset="[0, 4]"
    content-class="min-w-[150px]"
  >
    <Button
      :disclosure="active ? 'up' : 'down'"
      v-on="events"
    >
      Share results
    </Button>
  </Dropdown>
</template>
