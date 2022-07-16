<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import Header from '~/components/LandingPage/Header/index.vue'
import { notLoggedInMiddleware } from '~/utils/layout'
import layouts from '@/mixins/layouts'

export default defineComponent({
  name: 'LandingPageLayout',
  components: { Header },

  mixins: [layouts],
  middleware: notLoggedInMiddleware,
})
</script>

<template>
  <!-- Layout for clients not signed in -->
  <div
    :class="[
      /^auth-(?:sign-up|login)|privacy-and-policy/.test($route.name)
        ? 'bg-sky-light min-h-screen'
        : 'bg-surface-default',
      {
        'hide-ui': !mounted,
      },
    ]"
    @touchstart.passive="() => {}"
  >
    <Header />
    <NuxtChild />
  </div>
</template>
