<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api'
import { Layout } from '~/types'
import LandingPageMarkup from '@/components/LandingPage/IndexPage/index.vue'
import AppMarkup from '@/components/App/Home/index.vue'

export default defineComponent({
  name: 'IndexPage',
  components: { LandingPageMarkup, AppMarkup },
  layout: ({ $user }): Layout => {
    const loggedIn = $user.loggedIn

    if (loggedIn) {
      return 'app'
    }

    return 'landing-page'
  },
  transition: 'page-transition-slide-left',
  setup(_, { root: { $user } }) {
    const loggedIn = computed(() => $user.loggedIn)

    return { loggedIn }
  },

  head: {
    title: 'Home',
  },
})
</script>

<template>
  <AppMarkup v-if="loggedIn" />
  <LandingPageMarkup v-else />
</template>

<style lang="postcss">
.landing-page-title {
  @apply font-semibold text-[24px] md:text-[42px] leading-[28px] md:leading-[52.5px] text-center font-sf-pro-display;
}

.landing-page-subtitle {
  @apply text-[16px] md:text-[20px] leading-[28px] md:max-w-[550px] text-center mx-auto font-sf-pro-display;
}
</style>
