<script lang="ts">
import { computed, defineComponent, ref, watch } from '@vue/composition-api'

export default defineComponent({
  name: 'AppTrashListItem',
  components: {},
  props: {
    id: {
      type: String,
      required: true,
    },
    checked: Boolean,
    selectMode: Boolean,
  },
  emits: ['on-change'],

  setup(_props) {
    const isChecked = ref(_props.checked)

    const props = computed(() => _props)

    watch(
      () => props.value.checked,
      (nv) => (isChecked.value = nv)
    )

    return { isChecked }
  },
})
</script>

<template>
  <li
    class="bg-surface-default border border-divider rounded-lg p-20 flex items-center relative"
  >
    <span class="mr-18">
      <Checkbox
        :id="id"
        v-model="isChecked"
        label-hidden
        @update:modelValue="$emit('on-change', { id, checked: isChecked })"
      />
    </span>

    <div class="flex items-center w-full mr-8">
      <div class="w-[60%]">
        <strong> New Test </strong>

        <p class="caption">Created 12/03/2022 09:00AM</p>
      </div>

      <div class="w-[20%]">
        <strong> {{ 0 }} </strong>

        <p class="caption">Response{{ 0 > 1 ? 's' : '' }}</p>
      </div>

      <div class="w-[20%]">
        <strong> {{ 3 }}</strong>

        <p class="caption">Note{{ 3 > 1 ? 's' : '' }}</p>
      </div>
    </div>

    <div class="mr-12 shrink-0">
      <div class="flex space-x-2 items-center">
        <Button :disabled="selectMode"> Recover </Button>

        <Button :disabled="selectMode"> Delete permanently </Button>
      </div>
    </div>

    <label
      v-if="selectMode"
      :for="id"
      class="pseudo !pointer-events-auto cursor-pointer"
    >
      <span class="sr-only"> Select </span>
    </label>
  </li>
</template>

<style scoped lang="postcss">
.caption {
  @apply mt-8 text-caption-sm text-text-subdued;
}
</style>
