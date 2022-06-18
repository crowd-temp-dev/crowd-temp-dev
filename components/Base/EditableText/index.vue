<template>
  <div
    class="relative isolate h-fit w-fit"
    :class="{ 'min-w-[48px]': editing }"
    @click="edit"
    v-on="$listeners"
  >
    <span
      :aria-hidden="editing || undefined"
      class="inline-block transition-opacity"
      :class="{ 'opacity-0 pointer-events-none': editing }"
    >
      {{ modelSync || fallback }}
    </span>

    <template v-if="editing">
      <label :for="id" class="sr-only">
        {{ placeholder || 'Editing' }}
      </label>

      <input
        v-if="editing"
        :id="id"
        v-model="modelSync"
        type="text"
        :placeholder="placeholder || fallback"
        class="outline-none px-8 focus:ring-2 ring-offset-2 ring-action-primary-default rounded border border-border-default absolute z-1 left-0 h-full w-full fade-appear"
        @blur="stopEdit"
        @keydown.stop
        @keyup.enter.prevent="stopEdit"
        @keyup.esc.prevent="stopEdit"
      />
    </template>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, nextTick, ref } from '@vue/composition-api'
import { uid } from '~/utils'

export default defineComponent({
  name: 'EditableText',
  components: {},
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  props: {
    disabled: Boolean,
    modelValue: {
      type: String,
      default: undefined,
    },
    fallback: {
      type: String,
      default: undefined,
    },
    placeholder: {
      type: String,
      default: undefined,
    },
  },
  emits: ['edit-start', 'edit-done'],
  setup(_props, { emit }) {
    const editing = ref(false)

    const manualModelValue = ref(_props.fallback || '')

    const id = uid().replace(/\./g, '-')

    const modelSync = computed({
      get() {
        if (typeof _props.modelValue !== 'undefined') {
          return _props.modelValue
        }
        return manualModelValue.value
      },
      set(val: string) {
        if (typeof val === 'string') {
          emit('update:modelValue', val)

          manualModelValue.value = val
        }
      },
    })

    const edit = (evt: Event) => {
      if (_props.disabled) {
        editing.value = false
        return
      }

      editing.value = true

      const el = evt.currentTarget as unknown as HTMLElement

      if (el) {
        nextTick(() => {
          el.querySelector('input')?.focus()
        })
      }

      emit('edit-start')
    }

    const stopEdit = () => {
      editing.value = false

      if (!modelSync.value) {
        modelSync.value = _props.fallback
      }

      emit('edit-done')
    }

    return { editing, edit, stopEdit, modelSync, id }
  },
})
</script>

<style scoped></style>
