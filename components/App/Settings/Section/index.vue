<template>
  <section class="Section shadow-2 bg-surface-default p-20 rounded-lg">
    <h3
      class="text-heading font-semibold mb-20"
      :class="{ 'text-interactive-critical': destructive }"
    >
      {{ title }}
    </h3>

    <slot />

    <!-- footer -->
    <div v-if="!hideFooter" class="mt-20 flex flex-col items-end">
      <hr class="mb-20 w-11/12 border-[#F7F7F7]" />

      <slot name="cta" />
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  name: 'AppSettingsProfileSection',
  components: {},
  props: {
    destructive: Boolean,
    title: {
      type: String,
      required: true,
    },
    hideFooter: Boolean,
  },
  setup() {},
})
</script>

<style scoped>
.Section >>> .Polaris-FormLayout {
  margin-top: 0;
}
</style>
