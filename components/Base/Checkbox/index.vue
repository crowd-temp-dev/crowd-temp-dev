<template>
  <PCheckbox
    v-bind="$attrs"
    :id="id"
    ref="root"
    :checked="modelSync"
    :disabled="disabled"
    :label="label"
    :help-text="helpText"
    class="root"
    v-on="$listeners"
    @change="modelSync = !modelSync"
  >
    <template #label>
      <slot>
        {{ label }}
      </slot>
    </template>
  </PCheckbox>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api'

import formElement from '@/mixins/formElement'

export default defineComponent({
  name: 'BaseCheckbox',
  mixins: [formElement],
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  props: {
    modelValue: {
      type: Boolean,
      default: undefined,
    },
    checked: Boolean,
  },
  setup(_props, { emit }) {
    const manual = ref(_props.checked)

    const modelSync = computed({
      get() {
        if (typeof _props.modelValue === 'boolean') {
          return _props.modelValue
        }

        return manual.value
      },
      set(val: boolean) {
        if (typeof val === 'boolean') {
          if (typeof _props.modelValue === 'boolean') {
            emit('update:modelValue', val)
          }

          manual.value = val
        }
      },
    })

    return { modelSync }
  },
})
</script>

<style scoped lang="postcss">
.root:focus-within >>> .Polaris-Choice__Label {
  @apply underline;
}
</style>
