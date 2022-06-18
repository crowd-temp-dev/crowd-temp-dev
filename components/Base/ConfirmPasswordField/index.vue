<template>
  <PasswordField
    v-bind="$attrs"
    :id="id"
    ref="root"
    v-model="modelSync"
    :disabled="disabled"
    :data-matches="matches"
    :data-mismatch="!matches"
    :error="
      $attrs.error ||
      (!matches && dirtied && showMisMatchError ? noMatchText : undefined)
    "
    v-on="$listeners"
  />
</template>

<script lang="ts">
import {
  ComponentInstance,
  computed,
  defineComponent,
  ref,
  watch,
} from '@vue/composition-api'
import PasswordField from '../PasswordField/index.vue'

export default defineComponent({
  name: 'BaseConfirmPasswordField',
  components: { PasswordField },
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  props: {
    showMisMatchError: Boolean,
    noMatchText: {
      type: String,
      default: 'Passwords must match',
    },
    password: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    modelValue: {
      type: String,
      default: undefined,
    },
    disabled: Boolean,
  },
  emits: ['blur'],
  setup(_props, { emit }) {
    const root = ref(null)

    const manualModel = ref('')

    const dirtied = ref(false)

    const undefinedModel = computed(
      () => typeof _props.modelValue === 'undefined'
    )

    const modelSync = computed({
      get() {
        if (undefinedModel.value) {
          return manualModel.value
        }
        return _props.modelValue
      },
      set(val: string) {
        if (typeof val === 'string' && !_props.disabled) {
          dirtied.value = true

          if (!undefinedModel.value) {
            emit('update:modelValue', val)
          }
          manualModel.value = val
        }
      },
    })

    const matches = computed(() => {
      return modelSync.value === _props.password
    })

    const setValidationMessage = () => {
      const vnode = root.value as unknown as ComponentInstance

      if (vnode) {
        const el = vnode.$el as HTMLElement

        if (el) {
          const input = el.querySelector('input')

          if (input) {
            input.setCustomValidity(matches.value ? '' : _props.noMatchText)
          }
        }
      }
    }

    watch(() => matches.value, setValidationMessage)

    watch(() => modelSync.value, setValidationMessage)

    return {
      matches,
      modelSync,
      dirtied,
      root,
    }
  },
})
</script>

<style scoped></style>
