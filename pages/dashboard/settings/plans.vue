<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { Layout } from '~/types'
import Pricing from '~/components/LandingPage/Pricing/index.vue'

export default defineComponent({
  name: 'AppSettingsBillingPage',
  components: { Pricing },
  layout: 'app' as Layout,
  transition(_, from) {
    if (from) {
      if (from.path.startsWith('/settings/')) {
        if (
          /^\/settings\/(?:profile|team-members|custom-branding)\/?/.test(
            from.path
          )
        ) {
          return 'page-transition-slide-left'
        }
        return 'page-transition-slide-right'
      }
    }
    return 'page-transition-fade'
  },
  setup() {},

  head: {
    title: 'Plans settings',
    meta: [
      {
        hid: 'description',
        name: 'descrition',
        content: 'Configure your account billing settings',
      },
    ],
  },
})
</script>

<template>
  <div
    class="bg-surface-default relative max-w-app mx-auto rounded-lg shadow-2 p-20"
  >
    <Pricing settings-page price-tier="Free" />
  </div>
</template>
