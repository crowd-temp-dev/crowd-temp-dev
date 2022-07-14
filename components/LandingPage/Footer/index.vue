<template>
  <footer class="h-78 pt-24 pb-40 bg-surface-default shadow-2">
    <section
      class="max-w-[100rem] mx-auto flex justify-center md:justify-between items-start"
    >
      <h2 class="text-[20.07px] leading-[20.57px] font-medium hidden md:flex items-center">
        <NuxtLink to="/" class="inline-flex items-center">
          <Img
            src="static/logo"
            alt="App logo"
            :width="22.26"
            :height="16"
            class="h-16 w-[22.26px] mr-2"
          />

          crowd
        </NuxtLink>

        <span class="text-button ml-10">
          Built with ❤️ by
          <a
            href="https://www.unbugqa.com"
            target="_blank"
            rel="noreferrer noopener"
            class="text-action-primary-default"
            >UnbugQA</a
          >
        </span>
      </h2>

      <p>Follow us on</p>
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
