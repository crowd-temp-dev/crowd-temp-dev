<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  ref,
  watch,
} from '@vue/composition-api'
import { sleep } from '~/utils'

export default defineComponent({
  name: 'BasePasswordField',
  components: {},
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  props: {
    modelValue: {
      type: [String, Number],
      default: undefined,
    },
    id: {
      type: String,
      required: true,
    },
    disabled: Boolean,
    pattern: {
      type: String,
      default: undefined,
    },
    helpText: {
      type: String,
      default: undefined,
    },
    error: {
      type: String,
      default: undefined,
    },
    label: {
      type: String,
      default: '',
    },
    required: Boolean,
    readonly: Boolean,
    autofocus: Boolean,
    value: {
      type: [String, Number],
      default: '',
    },
    min: {
      type: String,
      default: undefined,
    },
    max: {
      type: String,
      default: undefined,
    },
  },
  setup(_props, { emit }) {
    const inputRef = ref<HTMLInputElement>()

    const props = computed(() => _props)

    const manualModel = ref(_props.value)

    const modelSync = computed({
      get() {
        const value = () => {
          if (/string|number/.test(typeof _props.modelValue)) {
            return parseFloat(_props.modelValue as string)
          }
          return parseFloat(manualModel.value as string)
        }

        if (_props.min) {
          return Math.max(value(), Number(_props.min))
        }

        if (_props.max) {
          return Math.min(value(), Number(_props.max))
        }

        return value()
      },
      set(val: string | number) {
        const update = (val: string | number) => {
          if (/string|number/.test(typeof _props.modelValue)) {
            emit('update:modelValue', val)
          }

          manualModel.value = val
        }

        const lessThanMin = _props.min && Number(val) < Number(_props.min)

        if (lessThanMin) {
          return update(_props.min)
        }

        const moreThanMax = _props.max && Number(val) > Number(_props.max)

        if (moreThanMax) {
          return update(_props.max)
        }

        update(val)
      },
    })

    const autofocus = async () => {
      await sleep()

      if (props.value.autofocus) {
        const input = inputRef.value

        if (input) {
          input.focus()
        }
      }
    }

    watch(() => props.value.autofocus, autofocus)

    onMounted(autofocus)

    const onInput = (evt: InputEvent) => {
      const input = evt.target as HTMLInputElement

      const newValue = parseFloat(input.value || '0')

      if (!isNaN(newValue)) {
        modelSync.value = newValue
      }

      input.value = `${modelSync.value}`
    }

    return { modelSync, inputRef, onInput }
  },
})
</script>

<template>
  <div class="PasswordField">
    <slot name="label">
      <label v-if="label" :for="id" class="mb-[0.4rem] inline-block">
        {{ label }}
      </label>
    </slot>

    <label
      :for="id"
      class="flex items-center w-full relative rounded h-36 border border-[#c9cccf] bg-surface-default border-t-[#aeb4b9] transition-shadow focus-within:ring-2 ring-offset-1 ring-action-primary-default duration-100"
    >
      <input
        :id="id"
        ref="inputRef"
        :value="modelSync"
        type="number"
        :required="required"
        :disabled="disabled || undefined"
        :pattern="pattern"
        :min="min"
        :max="max"
        :readonly="readonly || undefined"
        class="input w-full h-full outline-none rounded-[inherit] px-[1.2rem] py-[0.5rem]"
        @input="onInput"
      />
    </label>

    <p v-if="helpText" class="text-[#999fa4] mt-4">
      {{ helpText }}
    </p>

    <PInlineError v-if="error" class="mt-4" :field-id="id" :message="error" />
  </div>
</template>

<style scoped></style>
