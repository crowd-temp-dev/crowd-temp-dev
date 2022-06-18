<template>
  <TwoToneBg
    right-pane-class="fade-appear pl-48 xl:pl-64 pt-144 xl:pt-198 pr-32 xl:pr-64"
  >
    <template #right>
      <h2 class="font-semibold text-[28px] leading-[24px] mb-20">
        {{ title }}
      </h2>

      <p class="mb-24 max-w-[517px]">
        <slot name="subtitle">
          {{ subtitle }}
        </slot>
      </p>

      <slot name="cta" />
    </template>
  </TwoToneBg>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import TwoToneBg from '../TwoToneBg/index.vue'

export default defineComponent({
  name: 'AnswerTestWelcomePage',
  components: { TwoToneBg },
  props: {
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      default: undefined,
    },
  },
  setup() {},
})
</script>

<style scoped></style>
