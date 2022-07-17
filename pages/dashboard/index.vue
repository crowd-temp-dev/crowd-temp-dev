<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api'
import AppMarkup from '@/components/App/Home/index.vue'

export default defineComponent({
  name: 'IndexPage',
  components: { AppMarkup },
  layout: 'app',
  transition: 'page-transition-slide-left',
  setup(_, { root: { $user } }) {
    const loggedIn = computed(() => $user.loggedIn)

    return { loggedIn }
  },

  head: {
    title: 'Dashboard',
  },
})
</script>

<template>
  <AppMarkup v-if="loggedIn" />
</template>
