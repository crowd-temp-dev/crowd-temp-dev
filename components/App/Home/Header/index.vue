<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api'
import Button from '~/components/Base/Button/index.vue'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'
import { uuidv4 } from '~/utils'

export default defineComponent({
  name: 'AppHomeHeader',
  components: { Button, FadeTransition },
  setup(_, { root }) {
    const homeRoute = computed(() => root.$route.path === '/dashboard')

    const testId = ref(uuidv4())

    return { homeRoute, testId }
  },
})
</script>

<template>
  <FadeTransition>
    <div :key="`${homeRoute}`">
      <div class="flex items-center">
        <!-- <Button v-if="!homeRoute" icon="ArrowLeftMinor" title="Back" to="/dashboard" /> -->

        <h2
          class="font-sf-pro-display font-semibold text-[20px] leading-[32px]"
        >
          {{ homeRoute ? 'Dashboard' : 'Notifications' }}
        </h2>
      </div>

      <div v-if="homeRoute" class="flex items-center space-x-8">
        <Button plain-action>
          <div class="flex items-center">
            <PIcon source="ViewMinor" class="mr-6" />

            View template library
          </div>
        </Button>

        <Button :to="`/dashboard/project/${testId}`" primary>
          Create new project
        </Button>
      </div>
    </div>
  </FadeTransition>
</template>
