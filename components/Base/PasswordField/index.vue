<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import modelSync from '~/mixins/modelSync'
import { passwordRegExpString } from '~/utils'

export default defineComponent({
  name: 'BasePasswordField',
  components: {},
  mixins: [
    modelSync(
      {
        type: String,
        default: undefined,
      },
      (val, _props) => typeof val === 'string' && !_props.disabled
    ),
  ],
  props: {
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
    label: {
      type: String,
      default: 'Password',
    },
    required: Boolean,
  },
  setup() {
    const showPassword = ref(false)

    return { showPassword }
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

    <div
      class="flex items-center w-full relative rounded h-36 border border-[#c9cccf] bg-surface-default border-t-[#aeb4b9] transition-shadow focus-within:ring-2 ring-offset-1 ring-action-primary-default duration-100"
    >
      <input
        :id="id"
        v-model="modelSync"
        :type="showPassword ? 'text' : 'password'"
        :required="required"
        :pattern="pattern"
        :readonly="readonly || undefined"
        class="input w-full h-full outline-none rounded-[inherit] pr-[calc(20px+1.8rem)] pl-[1.2rem] py-[0.5rem]"
      />

      <PIcon
        :source="showPassword ? 'HideMinor' : 'ViewMinor'"
        class="fill-icon-default absolute right-[0.9rem] w-20 h-20 transition-opacity opacity-80 can-hover:hover:opacity-100 can-hover:active:opacity-70 active:opacity-70"
        :class="{ '!opacity-0': !modelSync || showPassword }"
        @click="showPassword = !showPassword"
      />
    </div>

    <p v-if="helpText" class="text-[#999fa4] mt-4">
      {{ helpText }}
    </p>

    <PInlineError v-if="error">
      {{ error }}
    </PInlineError>
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
