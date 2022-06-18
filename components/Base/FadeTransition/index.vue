<template>
  <Transition
    name="fade-transition"
    :mode="mode"
    :duration="duration"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <slot />
  </Transition>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  name: 'BaseFadeTransition',
  components: {},
  props: {
    mode: {
      type: String as () => 'out-in' | 'in-out' | undefined,
      default: 'out-in',
    },
    duration: {
      type: [String, Number, Object] as unknown as () =>
        | number
        | `${number}`
        | { enter: `${number}` | number; leave: `${number}` | number },
      default: undefined,
    },
  },
  setup() {},
})
</script>
