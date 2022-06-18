<template>
  <FadeTransition>
    <div :key="`${homeRoute}`">
      <div class="flex items-center">
        <Button v-if="!homeRoute" icon="ArrowLeftMinor" title="Back" to="/" />

        <h2
          class="font-sf-pro-display font-semibold text-[20px] leading-[32px]"
          :class="{ 'ml-16': !homeRoute }"
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

        <Button :to="`/create-test/${testId}`" primary> Create new test </Button>
      </div>
    </div>
  </FadeTransition>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api'
import Button from '~/components/Base/Button/index.vue'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'
import { uuidv4 } from '~/utils'

export default defineComponent({
  name: 'AppHomeHeader',
  components: { Button, FadeTransition },
  setup(_, { root }) {
    const homeRoute = computed(() => root.$route.path === '/')

    const testId = ref(uuidv4())

    return { homeRoute, testId }
  },
})
</script>
