<template>
  <AnswerTestPageTransition>
    <div v-if="loading" :key="loading" class="flex-centered bg-sky-light w-full h-full">
      <Spinner
        class="text-display-large lg:text-display-x-large text-icon-default"
      />
    </div>

    <div v-else class="grid grid-cols-2 grid-flow-col w-full h-full">
      <!-- <left pane> -->
      <section class="w-full h-full bg-sky-light" :class="[leftPaneClass]">
        <slot name="left" />
      </section>
      <!-- </left pane> -->

      <!-- <right pane> -->
      <section
        class="w-full h-full bg-surface-default"
        :class="[rightPaneClass]"
      >
        <slot name="right" />
      </section>
      <!-- </right pane> -->
    </div>
  </AnswerTestPageTransition>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import AnswerTestPageTransition from '~/components/Base/AnswerTestPageTransition/index.vue'
import Spinner from '~/components/Base/Spinner/index.vue'

export default defineComponent({
  name: 'AnswerTestTwoToneBg',
  components: { AnswerTestPageTransition, Spinner },
  props: {
    loading: Boolean,
    rightPaneClass: {
      type: [String, Array, Object],
      default: undefined,
    },
    leftPaneClass: {
      type: [String, Array, Object],
      default: undefined,
    },
  },
  setup() {},
})
</script>

<style scoped></style>
