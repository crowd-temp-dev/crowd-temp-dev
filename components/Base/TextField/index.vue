<template>
  <PTextField
    :id="id || uid"
    ref="root"
    v-model="modelSync"
    v-bind="$attrs"
    :value="value"
    :disabled="disabled"
    :label="label"
    :help-text="helpText"
    :type="type"
    v-on="$listeners"
  >
    <template v-if="$slots.default" #label>
      <slot>
        {{ label }}
      </slot>
    </template>
  </PTextField>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

import formElement from '@/mixins/formElement'
import { uid } from '~/utils'

export default defineComponent({
  name: 'BaseTextField',

  mixins: [formElement],
  model: {
    event: 'update:modelValue',
    prop: 'modelValue',
  },
  props: {
    modelValue: {
      type: String,
      default: undefined,
    },
    value: {
      type: String,
      default: undefined,
    },
    updateModelValue: {
      type: Function,
      default: undefined,
    },
  },
  data() {
    return {
      manualModel: this.value,
      uid: uid(),
    }
  },
  computed: {
    modelSync: {
      get() {
        if (typeof this.modelValue === 'string') {
          return this.modelValue as string
        }

        return this.manualModel as string
      },

      set(val: string) {
        if (typeof val === 'string' && !this.disabled) {
          if (typeof this.modelValue === 'string') {
            this.$emit('update:modelValue', val)

            if (typeof this.updateModelValue === 'function') {
              this.updateModelValue(val)
            }
          }

          this.manualModel = val
        }
      },
    },
  },
  created() {
    if (
      !this.modelSync &&
      typeof (
        this.$attrs.showCharacterCount || this.$attrs['show-character-count']
      ) !== 'undefined'
    ) {
      this.modelSync = ' '

      this.$nextTick(() => {
        this.modelSync = ''
      })
    }
  },
})
</script>

<style scoped></style>
