<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api'
import UiSwitch from '~/components/Base/UiSwitch/index.vue'
import { uid } from '~/utils'

export default defineComponent({
  name: 'AppCreateTestStepsConditionalSwitch',
  components: { UiSwitch },
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  props: {
    disabled: Boolean,
    label: {
      type: String,
      required: true,
    },
    showSwitch: {
      type: Boolean,
      default: true,
    },
    modelValue: {
      type: Boolean,
      default: undefined,
    },
    loading: Boolean,
  },
  setup(_props, { emit }) {
    const manualModelValue = ref(false)

    const modelSync = computed({
      get() {
        if (typeof _props.modelValue === 'boolean') {
          return _props.modelValue
        }
        return manualModelValue.value
      },
      set(val: boolean) {
        if (typeof val === 'boolean') {
          emit('update:modelValue', val)
          manualModelValue.value = val
        }
      },
    })
    const id = computed(() =>
      `${_props.label}-${uid()}`
        .replace(/\s/g, '-')
        .replace(/\./g, '-')
        .toLocaleLowerCase()
    )

    return { id, modelSync }
  },
})
</script>

<template>
  <div class="flex items-center space-x-8">
    <label
      :for="showSwitch ? id : undefined"
      :class="{
        'pointer-events-none': !showSwitch,
        '!cursor-default': disabled,
      }"
      class="Switch"
    >
      <slot>
        {{ label }}
      </slot>
    </label>

    <UiSwitch
      v-if="showSwitch"
      :id="id"
      v-model="modelSync"
      :disabled="disabled"
      :loading="loading"
    />
  </div>
</template>

<style scoped lang="postcss">
.Switch {
  @apply text-text-subdued uppercase text-sub-heading font-semibold cursor-pointer;
}
</style>
