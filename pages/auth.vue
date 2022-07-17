<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { dynamicPageTransition } from '@/utils/pageTransition'
import { Layout } from '~/types'

export default defineComponent({
  name: 'AuthPage',
  components: {},

  layout: 'landing-page' as Layout,

  transition: (to, from) =>
    dynamicPageTransition({
      to,
      from,
      useFade: /login|sign-up|forgot-password/.test(from?.path || ''),
    }),
})
</script>

<template>
  <div
    class="min-h-screen grid pt-40 md:pt-118 justify-center md:grid-cols-[750px] pb-100 px-10 md:px-0"
    :class="{ 'bg-sky-light': $route.name !== 'auth-account-confirmed' }"
  >
    <NuxtChild />
  </div>
</template>
