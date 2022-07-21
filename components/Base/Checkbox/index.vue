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
    <template v-if="$slots.default" #label>
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
  emits: ['on-change'],
  setup(_props, { emit }) {
    const manual = ref(_props.checked)

    const modelSync = computed({
      get() {
        if (typeof _props.modelValue === 'boolean') {
          return _props.modelValue || _props.checked
        }

        return manual.value || _props.checked
      },
      set(val: boolean) {
        if (typeof val === 'boolean') {
          if (typeof _props.modelValue === 'boolean') {
            emit('update:modelValue', val)
          }

          manual.value = val

          emit('on-change')
        }
      },
    })

    return { modelSync }
  },
})
</script>

<style scoped lang="postcss">
.root >>> .Polaris-Checkbox {
  @apply transition-shadow rounded ring-action-primary-default;
}

.root:focus-within >>> .Polaris-Checkbox {
  @apply ring-2 ring-offset-1;
}
</style>
