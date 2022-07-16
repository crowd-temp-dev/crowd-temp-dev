<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api'
import { Layout } from '~/types'
import { dynamicPageTransition } from '~/utils/pageTransition'
import Button from '~/components/Base/Button/index.vue'
import { createTestWarningDuplicateId } from '~/utils'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'
import { RootState } from '~/store'

export default defineComponent({
  name: 'AppBillingPage',
  components: { Button, FadeTransition },
  layout: 'app' as Layout,
  transition: (to, from) =>
    dynamicPageTransition({
      to,
      from,
    }),
  setup(_, { root }) {
    const state = computed(() => {
      return (root.$store.state as RootState).testSuite
    })

    const showWarning = computed(() => {
      return (
        root.$route.name === 'create-test-:id' && state.value.create.showWarning
      )
    })

    const duplicating = computed(() => {
      return state.value.create.submitting
    })

    const responses = computed(() => {
      return state.value.detail.responses
    })

    const message = computed(() => {
      return `${
        !responses.value ? 'This test has some participants. ' : ''
      } Making any update to this test will cancel your sharable link${
        responses.value ? ' and delete all your responses.' : '.'
      }`
    })

    const duplicateTest = async () => {
      await root.$store.dispatch('testSuite/create/duplicate')
    }

    const continueTest = () => {
      root.$store.commit('testSuite/create/setShowWarning', false)
    }

    return {
      message,
      responses,
      showWarning,
      duplicating,
      createTestWarningDuplicateId,
      duplicateTest,
      continueTest,
    }
  },

  head: {
    title: 'Create test',
  },
})
</script>

<template>
  <FadeTransition :duration="{ leave: 1, enter: 200 }">
    <div v-if="showWarning" class="sticky top-76 z-1">
      <div
        class="bg-[#202123] text-surface-default shadow-3 h-56 px-32 flex items-center justify-between fill-before before:bg-current before:opacity-0 before:animate-[pulse_250ms_2_300ms] relative"
        :style="{ '--fade-transition-duration': '150ms' }"
      >
        <p class="mr-16">
          {{ message }}
        </p>

        <div class="flex items-center space-x-6">
          <Button
            :id="createTestWarningDuplicateId"
            primary
            class="border-0"
            :loading="duplicating"
            @click="duplicateTest"
          >
            Duplicate test
          </Button>

          <Button
            destructive
            class="border border-interactive-critical after:ring-interactive-critical focus:after:ring-[0.2rem] !shadow-none ring-offset-2 ring-offset-black !bg-transparent hover:!bg-action-critical-hovered"
            @click="continueTest"
          >
            <span class="text-white"> Continue </span>
          </Button>
        </div>
      </div>
    </div>
  </FadeTransition>
</template>
