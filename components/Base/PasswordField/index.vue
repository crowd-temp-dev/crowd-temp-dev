<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  ref,
  watch,
} from '@vue/composition-api'
import { passwordRegExpString, sleep } from '~/utils'

export default defineComponent({
  name: 'BasePasswordField',
  components: {},
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    id: {
      type: String,
      required: true,
    },
    disabled: Boolean,
    pattern: {
      type: String,
      default: passwordRegExpString,
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
      default: 'Password',
    },
    required: Boolean,
    readonly: Boolean,
    autofocus: Boolean,
  },
  setup(_props, { emit }) {
    const showPassword = ref(false)

    const inputRef = ref<HTMLInputElement>()

    const props = computed(() => _props)

    const modelSync = computed({
      get() {
        return _props.modelValue
      },
      set(val: string) {
        emit('update:modelValue', val)
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

    return { showPassword, modelSync, inputRef }
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
        v-model="modelSync"
        :type="showPassword ? 'text' : 'password'"
        :required="required"
        :disabled="disabled || undefined"
        :pattern="pattern"
        :readonly="readonly || undefined"
        class="input w-full h-full outline-none rounded-[inherit] pr-[calc(20px+1.8rem)] pl-[1.2rem] py-[0.5rem]"
      />

      <PIcon
        :source="showPassword ? 'HideMinor' : 'ViewMinor'"
        class="fill-icon-default absolute right-[0.9rem] w-20 h-20 transition-opacity opacity-80 can-hover:hover:opacity-100 can-hover:active:opacity-70 active:opacity-70"
        :class="{
          '!opacity-0 pointer-events-none': !modelSync && !showPassword,
          'pointer-events-none': (disabled || $attrs.disabled) && !showPassword,
        }"
        @click="showPassword = !showPassword"
      />
    </label>

    <p v-if="helpText" class="text-[#999fa4] mt-4">
      {{ helpText }}
    </p>

    <PInlineError v-if="error" class="mt-4" :field-id="id" :message="error" />
  </div>
</template>

<style scoped>
.input::-ms-reveal,
.input::-ms-clear {
  display: none !important;
}

.input {
  appearance: none;
}
</style>
