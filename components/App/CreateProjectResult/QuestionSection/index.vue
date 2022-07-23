<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import PreviewQuestion from './PreviewQuestion/index.vue'

export default defineComponent({
  name: 'AppProjectResultQuestionSection',
  components: { PreviewQuestion },
  props: {
    title: {
      type: String,
      required: true,
    },
  },
})
</script>

<template>
  <section class="shadow-2 bg-surface-default p-20 pt-40 rounded-lg w-full">
    <div class="flex items-center justify-between mb-20">
      <h2 class="font-sf-pro-display font-semibold text-[20px] leading-[32px]">
        {{ title }}
      </h2>

      <div class="flex space-x-20 items-center">
        <slot name="header-action" />

        <div>
          <PreviewQuestion :title="title" />

          <Button class="ml-12">
            Collapse
          </Button>
        </div>
      </div>
    </div>

    <hr class="mb-20" />

    <div class="grid gap-y-20">
      <slot />
    </div>
  </section>
</template>
