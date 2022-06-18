<template>
  <!-- Layout for clients not signed in -->
  <div class="bg-surface-default" :class="{ 'hide-ui': !mounted }">
    <Header />
    <NuxtChild />
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  watch,
} from '@vue/composition-api'
import Header from '~/components/LandingPage/Header/index.vue'
import { notLoggedInMiddleware } from '~/utils/layout'
import layouts from '@/mixins/layouts'

export default defineComponent({
  name: 'LandingPageLayout',
  components: { Header },

  mixins: [layouts],
  middleware: notLoggedInMiddleware,
  setup(_, { root }) {
    const validHash = ['features', 'pricing', 'contact']

    const hash = computed(() => root.$route.hash)

    const scrollToHash = (routeHash: string) => {
      const hashValue = routeHash.replace(/^#/, '').trim()

      if (validHash.includes(hashValue)) {
        const hashEl = document.getElementById(hashValue) as HTMLElement

        if (hashEl) {
          const header = document.getElementById(
            'landing-page-header'
          ) as HTMLElement

          const top = hashEl.offsetTop - (32 + (header ? header.offsetTop : 0))

          document.documentElement.scrollTo({
            top,
            behavior: 'smooth',
          })
        }
      }
    }

    watch(() => hash.value, scrollToHash)

    onMounted(() => {
      scrollToHash(hash.value)
    })
  },
})
</script>

<style scoped></style>
