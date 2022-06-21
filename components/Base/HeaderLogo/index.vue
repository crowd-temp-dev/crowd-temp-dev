<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  name: 'BaseHeaderLogo',
  components: {},
  setup() {
    const scrollToTop = () =>
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })

    return { scrollToTop }
  },
})
</script>

<template>
  <h1 class="text-[20.07px] leading-[20.57px] font-medium font-epilogue">
    <NuxtLink
      to="/"
      class="inline-flex items-center"
      @click.native="scrollToTop"
    >
      <PImage
        source="/logo.png"
        alt="App logo"
        :width="22.26"
        :height="16"
        class="h-16 w-[22.26px] mr-2"
      />

      crowd
    </NuxtLink>
  </h1>
</template>
