<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api'
import IndexPageHeader from '@/components/App/Home/Header/index.vue'
import ProjectPageHeader from '@/components/App/CreateProject/Header/index.vue'
import NotesPageHeader from '@/components/App/Notes/Header/index.vue'

import FadeTransition from '~/components/Base/FadeTransition/index.vue'

export default defineComponent({
  name: 'AppPageHeader',
  components: {
    IndexPageHeader,
    ProjectPageHeader,
    FadeTransition,
    NotesPageHeader,
  },
  setup(_, { root }) {
    const headerComponent = computed(() => {
      const routePath = root.$route.path

      if (routePath === '/dashboard') {
        return 'IndexPageHeader'
      }

      if (routePath.startsWith('/dashboard/project')) {
        return 'ProjectPageHeader'
      }

      if (routePath.startsWith('/dashboard/settings')) {
        return 'SettingsPage'
      }

      if (routePath.startsWith('/dashboard/notes')) {
        return 'NotesPageHeader'
      }

      if (routePath.startsWith('/dashboard/integrations')) {
        return 'IntegrationsPage'
      }

      if (routePath.startsWith('/dashboard/trash')) {
        return 'TrashPage'
      }

      return 'IndexPageHeader'
    })

    const headerTitle = computed(() => {
      switch (headerComponent.value) {
        case 'IntegrationsPage':
          return 'Integrations'
        case 'SettingsPage':
          return 'Settings'
        case 'TrashPage':
          return 'Trash'
        default:
          return null
      }
    })

    return { headerComponent, headerTitle }
  },
})
</script>

<template>
  <div class="app-page-header">
    <FadeTransition :duration="{ leave: 100 }">
      <div
        v-if="headerTitle"
        :key="headerTitle"
        class="min-w-full xl:min-w-[initial]"
      >
        <div class="flex items-center">
          <h2
            class="mr-8 font-sf-pro-display font-semibold text-[20px] leading-[32px]"
          >
            {{ headerTitle }}
          </h2>
        </div>
      </div>

      <Component :is="headerComponent" v-else />
    </FadeTransition>
  </div>
</template>
