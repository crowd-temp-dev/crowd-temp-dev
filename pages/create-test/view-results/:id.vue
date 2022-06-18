<template>
  <div
    class="mt-32 grid grid-cols-[1fr,auto] grid-flow-col gap-x-32 max-w-app mx-auto pb-112 min-w-full"
  >
    <div class="min-w-[min(100%,800px)] grid gap-y-32">
      <Summary />

      <DesignSurvey :numbering="1" />
    </div>

    <Notes />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import Notes from '@/components/App/CreateTestResult/Notes/index.vue'
import Summary from '@/components/App/CreateTestResult/Summary/index.vue'
import DesignSurvey from '@/components/App/CreateTestResult/DesignSurvey/index.vue'
import { dynamicPageTransition } from '~/utils/pageTransition'
import { splitPath } from '~/utils'

interface Feature {
  title: string
  locked?: boolean
  active?: boolean
}

export default defineComponent({
  name: 'AppCreateTestRecruitPage',
  components: { Notes, Summary, DesignSurvey },

  transition: (to, from) => {
    const splitFrom = splitPath(from?.path || '')

    if (splitFrom[0] === 'create-test') {
      return 'page-transition-slide-right'
    }

    return dynamicPageTransition({
      to,
      from,
    })
  },

  setup() {
    const showLink = ref(false)

    const features = ref<Feature[]>([
      {
        title: 'Unlimited invites',
      },
      {
        title: 'Stop accepting responses',
      },
      {
        title: 'Survey demographics',
        locked: true,
      },
      {
        title: 'Re-direct after tests',
        locked: true,
      },
      {
        title: 'Custom branding',
        locked: true,
      },
      {
        title: 'Session recordings',
        locked: true,
      },
    ])

    return { features, showLink }
  },
})
</script>
