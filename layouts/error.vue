<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api'
import { NuxtError } from '@nuxt/types'
import Button from '~/components/Base/Button/index.vue'
import layouts from '~/mixins/layouts'
import { AnswerTestState } from '~/store/answer-test'

export default defineComponent({
  name: 'DefaultLayout',

  components: { Button },
  mixins: [layouts],

  props: {
    error: {
      type: Object as () => NuxtError,
      default: () =>
        ({
          statusCode: 500,
          message: 'An error occured',
        } as NuxtError),
    },
  },

  setup(_, { root }) {
    const homePage = computed(() => {
      if (root.$route.path.startsWith('/answer-test')) {
        return `/answer-test/${
          (root.$store.state['answer-test'] as AnswerTestState).shareLink
        }`
      }

      return '/'
    })

    return { homePage }
  },

  head() {
    return {
      title: this.error.statusCode,
      meta: [
        {
          hid: 'description',
          name: 'descrition',
          content: this.error.message,
        },
      ],
    }
  },
})
</script>

<template>
  <div
    class="bg-surface-default font-sf-pro-display grid justify-center pt-100 text-center"
    :class="{ 'hide-ui': !mounted }"
  >
    <h1 class="sr-only"></h1>

    <h2
      class="text-action-critical-default font-bold text-display-x-large-sm md:text-display-x-large mb-16"
    >
      {{ error.statusCode }}
    </h2>

    <h3 class="text-text-subdued mb-32 text-display-medium-sm md:text-medium">
      {{ error.message }}
    </h3>

    <Button :to="homePage" primary size="large"> Back to homepage </Button>
  </div>
</template>
