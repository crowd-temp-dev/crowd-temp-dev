<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api'

import formElement from '@/mixins/formElement'

export default defineComponent({
  name: 'BaseRadio',
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
    disabled: Boolean,
    helpText: {
      type: String,
      default: undefined,
    },
    label: {
      type: String,
      default: 'Password',
    },
    required: Boolean,
    readonly: Boolean,
    autofocus: Boolean,
    name: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
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

<template>
  <div>
    <!-- <PRadioButton
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
    </PRadioButton> -->

    <label :for="id" class="relative flex items-center cursor-pointer">
      <span class="flex-centered relative">
        <input
          :id="id"
          type="radio"
          :checked="modelSync"
          :value="value"
          :name="name"
          :required="required"
          class="sr-only peer position-center absolute"
          @change="modelSync = !modelSync"
        />

        <span
          class="rounded-full w-18 h-18 border inline-flex border-border-default peer-checked:border-interactive-default peer-checked:border-2 relative fill-before before:!w-10 before:!h-10 before:!inset-[auto] before:bg-action-primary-default items-center justify-center before:scale-0 before:transition-transform before:transform-gpu peer-checked:before:scale-100 lg:transition-all peer-focus:border-action-primary-pressed peer-focus:border-2 bg-surface-default"
        />
      </span>

      <slot name="label">
        <span v-if="label" class="ml-8"> {{ label }} </span>
      </slot>
    </label>
  </div>
</template>

<style scoped lang="postcss">
.root:focus-within >>> .Polaris-Choice__Label {
  @apply underline;
}
</style>
