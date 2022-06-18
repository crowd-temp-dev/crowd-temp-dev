<template>
  <div class="app-page-header">
    <FadeTransition :duration="{ leave: 100 }">
      <Component :is="headerComponent" />
    </FadeTransition>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api'
import IndexPageHeader from '@/components/App/Home/Header/index.vue'
import CreateTestPageHeader from '@/components/App/CreateTest/Header/index.vue'
import SettingsPageHeader from '@/components/App/Settings/Header/index.vue'
import NotesPageHeader from '@/components/App/Notes/Header/index.vue'


import FadeTransition from '~/components/Base/FadeTransition/index.vue'

export default defineComponent({
  name: 'AppPageHeader',
  components: {
    IndexPageHeader,
    CreateTestPageHeader,
    FadeTransition,
    SettingsPageHeader,
    NotesPageHeader
  },
  setup(_, { root }) {
    const headerComponent = computed(() => {
      const routePath = root.$route.path

      if (routePath === '/') {
        return 'IndexPageHeader'
      }

      if (routePath.startsWith('/create-test')) {
        return 'CreateTestPageHeader'
      }

      if (routePath.startsWith('/settings')) {
        return 'SettingsPageHeader'
      }

      if(routePath.startsWith('/notes')){
        return  'NotesPageHeader'
      }

      return 'IndexPageHeader'
    })

    return { headerComponent }
  },
})
</script>

<style scoped lang="postcss"></style>
