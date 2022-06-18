<template>
  <TextField
    v-bind="$attrs"
    :id="id"
    v-model="modelSync"
    :label="label"
    type="password"
    :help-text="helpText"
    :required="required"
    :pattern="pattern"
    :disabled="disabled"
    v-on="$listeners"
  />
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
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
  setup() {},
})
</script>

<style scoped></style>
