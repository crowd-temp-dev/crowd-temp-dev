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
    iconClass: {
      type: String,
      default: undefined,
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
  <Id v-slot="idProps">
    <label
      ref="root"
      :for="id || idProps.id"
      class="relative flex items-center cursor-pointer group"
    >
      <span :class="iconClass" class="flex-centered">
        <span
          class="relative rounded-full w-18 h-18 border inline-flex fill-before before:!w-10 before:!h-10 before:!inset-[auto] before:bg-action-primary-default items-center justify-center before:scale-0 before:transition-transform before:transform-gpu lg:transition-all bg-surface-default group-focus-within:border-action-primary-pressed group-focus-within:border-2"
          :class="[
            {
              'border-interactive-default !border-2 before:scale-100':
                modelSync,
              'border-border-default': !modelSync,
            },
          ]"
        >
          <input
            :id="id || idProps.id"
            type="radio"
            :disabled="disabled || undefined"
            :checked="modelSync"
            data-pseudo-input
            :value="value"
            :name="name"
            :required="required"
            class="sr-only peer position-center absolute"
            @change="modelSync = $event.target.checked"
          />
        </span>
      </span>

      <slot name="label">
        <span
          v-if="label"
          class="ml-8 transition-opacity group-active:opacity-70"
        >
          {{ label }}
        </span>
      </slot>
    </label>
  </Id>
</template>

<style scoped lang="postcss">
.root:focus-within >>> .Polaris-Choice__Label {
  @apply underline;
}
</style>
