<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import CardDetails from '../../../components/App/Settings/Billing/CardDetails/index.vue'
import { Layout } from '~/types'
import PlanDetails from '~/components/App/Settings/Billing/PlanDetails/index.vue'
import History from '~/components/App/Settings/Billing/History/index.vue'

export default defineComponent({
  name: 'AppSettingsBillingPage',
  components: { PlanDetails, CardDetails, History },
  layout: 'app' as Layout,
  transition(_, from) {
    if (from) {
      if (from.path.startsWith('/settings/')) {
        return 'page-transition-slide-left'
      }
    }
    return 'page-transition-fade'
  },
  setup() {},

  head: {
    title: 'Billing settings',
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
  <div class="min-w-full">
    <div class="grid gap-y-32 max-w-[800px]">
      <PlanDetails />

      <CardDetails />

      <History />
    </div>
  </div>
</template>
