<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import Button from '@/components/Base/Button/index.vue'

export default defineComponent({
  name: 'AppMobileDevice',
  components: { Button },
  setup() {},
})
</script>

<template>
  <div class="min-h-screen bg-sky-light transform-gpu">
    <header class="pt-24 pl-10 mb-36">
      <h1 class="text-[20.07px] leading-[20.57px] font-medium font-epilogue">
        <NuxtLink to="/" class="flex items-center">
          <Img
            src="static/logo.png"
            alt="App logo"
            :width="22.26"
            :height="16"
            class="h-16 w-[22.26px] mr-2"
          />

          crowd
        </NuxtLink>
      </h1>
    </header>

    <main class="grid justify-items-center font-sf-pro-display px-16">
      <Img
        src="static/png/app/small-screen-vector"
        alt="Vector image of a person standing beside a question mark"
        :width="234.67"
        :height="176"
        class="w-[234.67px] h-176"
      />

      <h2 class="text-[22px] leading-[28px] font-semibold">Oops</h2>

      <p class="w-274 mt-8 mb-24 text-[16px] leading-[28px] text-center">
        Looks like you're on a mobile device, switch to Desktop view to access
        this dashboard
      </p>

      <div
        class="grid grid-rows-2 sm:grid-rows-1 gap-20 justify-items-center items-center"
      >
        <Button
          primary
          size="large"
          @click="$store.commit('app/setAllowMobileView', true)"
        >
          Switch to desktop view
        </Button>

        <Button size="large" to="/"> Back to homepage </Button>
      </div>
    </main>
  </div>
</template>
