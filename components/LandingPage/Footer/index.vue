<template>
  <footer class="h-78 pt-10 pb-40 bg-surface-default shadow-2">
    <section
      class="max-w-[100rem] mx-auto flex justify-center md:justify-between items-start"
    >
      <h2 class="text-[20.07px] leading-[20.57px] font-medium hidden md:block">
        <NuxtLink to="/" class="flex items-center">
          <Img
            src="static/logo"
            alt="App logo"
            :width="22.26"
            :height="16"
            class="h-16 w-[22.26px] mr-2"
          />

          crowd
        </NuxtLink>
      </h2>

      <p>Footer will show here</p>
    </section>
  </footer>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  name: 'LandingPageFooter',
  components: {},
  setup() {},
})
</script>

<style scoped></style>
