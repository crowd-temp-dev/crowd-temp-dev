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
  <div class="bg-surface-default" :class="{ 'hide-ui': !mounted }">
    <Header />
    <NuxtChild />
  </div>
</template>
