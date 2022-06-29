<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api'
import UiDialog from '../UiDialog/index.vue'
import Button from '@/components/Base/Button/index.vue'
import { getDialogAttrs, uid } from '~/utils'

export default defineComponent({
  name: 'BaseDialogButton',
  components: { Button, UiDialog },
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  props: {
    disableButton: Boolean,
    modelValue: {
      type: Boolean,
      default: undefined,
    },
    label: {
      type: String,
      default: 'dialog',
    },
    dialogAttrs: {
      type: Object,
      default: () => ({
        title: 'Dialog',
      }),
    },
    dialogEvents: {
      type: Object,
      default: () => ({}),
    },
    dialogStyle: {
      type: [String, Object],
      default: undefined,
    },
    dialogClass: {
      type: [String, Object, Array],
      default: undefined,
    },
    dialogContentStyle: {
      type: [String, Object],
      default: undefined,
    },
    dialogContentClass: {
      type: [String, Object, Array],
      default: undefined,
    },
    hideBackdrop: Boolean,
  },
  setup(_props, { emit }) {
    const manual = ref(false)

    const modelSync = computed({
      get() {
        if (typeof _props.modelValue === 'undefined') {
          return manual.value
        }
        return _props.modelValue
      },
      set(val: boolean) {
        if (typeof val === 'boolean') {
          if (typeof _props.modelValue !== 'undefined') {
            emit('update:modelValue', val)
          }
          manual.value = val
        }
      },
    })

    const toggle = (val: boolean) => (modelSync.value = val)

    const open = () => toggle(true)
    const close = () => toggle(false)

    const attemptOpen = (e: Event) => {
      emit('click', e)

      if (_props.disableButton) return

      if (typeof _props.modelValue === 'undefined') {
        open()
      }
    }

    const id = uid()

    const syncAttrs = computed(() =>
      getDialogAttrs(modelSync.value, id, !_props.hideBackdrop)
    )

    const payload = computed(() => ({
      open,
      close,
      active: modelSync.value,
    }))

    return { modelSync, attemptOpen, syncAttrs, payload }
  },
})
</script>

<template>
  <Button
    v-bind="{ ...$attrs, ...syncAttrs.trigger }"
    :disabled="disableButton"
    v-on="$listeners"
    @click="attemptOpen"
  >
    <slot v-bind="payload" />

    <UiDialog
      v-model="modelSync"
      v-bind="{ ...syncAttrs.dialog, ...dialogAttrs }"
      :style="dialogStyle"
      :class="dialogClass"
      :content-class="dialogContentClass"
      :content-style="dialogContentStyle"
      :hide-backdrop="hideBackdrop"
      v-on="{ ...dialogEvents }"
    >
      <template #prefix>
        <h2
          v-if="label && modelSync"
          class="sr-only"
          v-bind="syncAttrs.describedby"
        >
          {{ label }}
        </h2>
      </template>

      <template #header>
        <slot name="dialog-header" v-bind="payload" />
      </template>

      <slot name="dialog" v-bind="payload" />

      <template #footer>
        <slot name="dialog-footer" v-bind="payload" />
      </template>
    </UiDialog>
  </Button>
</template>
