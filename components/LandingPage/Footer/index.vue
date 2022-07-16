<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  name: 'LandingPageFooter',
  components: {},
  setup() {
    const scrollToTop = () => {
      scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }

    return { scrollToTop }
  },
})
</script>

<template>
  <footer class="md:h-78 pt-24 pb-40 bg-surface-default shadow-2">
    <section
      class="max-w-[100rem] flex-wrap md:flex-nowrap mx-auto flex items-center justify-center md:justify-between lg:items-start"
    >
      <h2
        class="order-2 md:order-[initial] mt-20 md:mt-0 text-[20.07px] leading-[20.57px] font-medium flex items-center flex-wrap md:flex-nowrap"
      >
        <span
          class="transition-opacity active:opacity-70 mx-auto md:mx-[initial] shrink-0 mb-10 md:mb-0"
          @click="scrollToTop"
        >
          <NuxtLink to="/" class="inline-flex items-center">
            <Img
              src="static/logo.png"
              alt="App logo"
              :width="22.26"
              :height="16"
              class="h-16 w-[22.26px] mr-2"
            />

            crowd
          </NuxtLink>
        </span>

        <span class="text-button ml-10 w-full text-center">
          Built with ❤️ by
          <a
            href="https://www.unbugqa.com"
            target="_blank"
            rel="noreferrer noopener"
            class="text-action-primary-default hover:underline hover:text-action-primary-hovered active:text-action-primary-pressed"
            >UnbugQA</a
          >
        </span>
      </h2>

      <p class="order-1 md:order-[initial] w-full md:w-[initial] text-center">Follow us on</p>
    </section>
  </footer>
</template>
