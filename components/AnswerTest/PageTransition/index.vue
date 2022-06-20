<template>
  <Transition
    name="answer-page-transition"
    :mode="mode"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <slot />
  </Transition>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  name: 'AnswerTestPageTransition',
  components: {},
  props: {
    mode: {
      type: String as () => 'out-in' | 'in-out' | undefined,
      default: 'out-in',
    },
  },
})
</script>
