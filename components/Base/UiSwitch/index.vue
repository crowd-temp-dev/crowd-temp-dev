<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api'
import FadeTransition from '../FadeTransition/index.vue'
import Spinner from '~/components/Base/Spinner/index.vue'

export default defineComponent({
  name: 'BaseSwitch',
  components: { Spinner, FadeTransition },
  model: {
    event: 'update:modelValue',
    prop: 'modelValue',
  },
  props: {
    disabled: Boolean,
    loading: Boolean,
    modelValue: {
      type: Boolean,
      default: undefined,
    },
    id: {
      type: String,
      required: true,
    },
    alwaysFilled: Boolean,
  },
  emits: ['update:modelValue'],
  setup(_props, { emit }) {
    const manual = ref(false)

    const input = ref(null)

    const noModel = computed(() => typeof _props.modelValue === 'undefined')

    const modelSync = computed({
      get() {
        if (noModel.value) {
          return manual.value
        }

        return _props.modelValue
      },
      set(val: boolean) {
        if (typeof val === 'boolean' && !_props.disabled) {
          if (noModel.value) {
            manual.value = val
          } else {
            emit('update:modelValue', val)
          }
        }
      },
    })

    const clickInput = () => {
      const inputEl = input.value as unknown as HTMLElement

      if (inputEl) {
        inputEl.focus()

        inputEl.click()
      }
    }

    return {
      modelSync,
      input,
      clickInput,
    }
  },
})
</script>

<template>
  <span class="inline-flex items-center justify-center">
    <button
      type="button"
      role="switch"
      :aria-checked="`${modelSync}`"
      tabindex="-1"
      class="Switch"
      :class="{
        'cursor-pointer': !loading && !disabled,
        'pointer-events-none': loading || disabled,
        'grayscale-[50%] opacity-50': disabled,
        'opacity-0': loading,
        checked: modelSync,
        filled: alwaysFilled,
      }"
      @click.self="clickInput"
      @keyup.right.prevent.stop="modelSync = true"
      @keyup.left.prevent.stop="modelSync = false"
    >
      <input
        :id="id"
        ref="input"
        v-model="modelSync"
        type="checkbox"
        :disabled="disabled"
        :readonly="loading"
        class="appearance-none sr-only input left-[50%] translate-x-[-50%]"
      />
      <!-- thumb -->
      <div class="thumb" @click.self="clickInput"></div>
    </button>

    <FadeTransition>
      <span v-if="loading" class="inline-flex absolute text-icon-default">
        <Spinner />
      </span>
    </FadeTransition>
  </span>
</template>

<style scoped lang="postcss">
.Switch {
  @apply h-22 w-44 rounded-full bg-[#BFBFBF] inline-flex items-center p-2 relative before:transition-opacity before:bg-action-primary-default before:w-full before:h-full before:rounded-full before:absolute before:left-0 before:top-0 before:block isolate before:-z-1 before:pointer-events-none before:opacity-0 focus-within:ring-2 ring-action-primary-default ring-offset-[1.5px] before:duration-300 transition-[box-shadow,opacity] hover:before:opacity-20;
}

.Switch.checked,
.Switch.filled {
  @apply before:opacity-100;
}

.thumb {
  @apply relative w-18 h-18 bg-white rounded-full duration-300;
  box-shadow: 0px 2px 4px rgba(0, 35, 11, 0.2);
  transition-timing-function: var(--ease-back-out);
}

.input:active ~ .thumb,
.Switch:active .thumb {
  @apply scale-[0.925];
}

.checked .thumb {
  @apply translate-x-22;
}
</style>
