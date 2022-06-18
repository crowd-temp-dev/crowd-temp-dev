<script lang="ts">
import { defineComponent } from "@vue/composition-api";

export default defineComponent({
  name:"AnswerTestTemplateBlankPage",
})
</script>


<template>
  <div class="w-screen h-screen bg-surface-default flex justify-center mt-198">
    <slot />
  </div>
</template>
