<template>
  <section class="shadow-2 bg-surface-default p-20 pt-40 rounded-lg w-full">
    <div class="flex items-center justify-between mb-20">
      <h2 class="font-sf-pro-display font-semibold text-[20px] leading-[32px]">
        {{ numbering }}. Design Survey
      </h2>

      <Button plain-action> Previous questions </Button>
    </div>

    <hr class="mb-20" />

    <div class="grid gap-y-20">
      <Question :numbering="`${numbering}a`" />

      <Question :numbering="`${numbering}b`" type="Multichoice" />

      <Question :numbering="`${numbering}c`" type="Multichoice" />
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import Question from './Question/index.vue'
import Button from '~/components/Base/Button/index.vue'

export default defineComponent({
  name: 'AppCreateTestResultDesignSurvey',
  components: { Button, Question },
  props: {
    numbering: {
      type: Number,
      required: true,
    },
  },
  setup() {},
})
</script>

<style scoped></style>
