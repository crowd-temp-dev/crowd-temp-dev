<template>
  <div
    class="bg-surface-default max-w-[100%] md:max-w-[620px] mx-auto rounded-[5px] px-16 md:px-30 py-32 md:py-30"
  >
    <template v-if="!plain">
      <!-- the header slot -->
      <div class="text-left mb-20 text-text-subdued">
        <slot name="header" />
      </div>

      <!-- Social buttons -->
      <div
        class="flex items-center flex-wrap md:flex-nowrap space-y-12 md:space-y-0 md:space-x-12"
      >
        <slot name="socials" />
      </div>

      <!-- divider -->
      <div
        class="flex items-center before:block after:block before:border-b after:border-b before:border-[#F7F7F7] after:border-[#F7F7F7] before:w-full after:w-full before:h-1 after:h-1 before:pointer-events-none after:pointer-events-none before:mr-8 after:ml-8 my-20"
      >
        OR
      </div>

      <!-- body slot (DEFAULT) -->
      <slot />
    </template>

    <slot v-else />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  name: 'FormAuth',
  props: { plain: Boolean },
  setup() {},
})
</script>

<style scoped></style>
