<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api'
import { NuxtError } from '@nuxt/types'
import Button from '~/components/Base/Button/index.vue'
import layouts from '~/mixins/layouts'
import { AnswerTestState } from '~/store/answer-test'
import FeedbackForm from '~/components/Base/RouteDialog/FeedbackForm/index.vue'
import Header from '~/components/LandingPage/Header/index.vue'

export default defineComponent({
  name: 'DefaultLayout',

  components: { Button, FeedbackForm, Header },
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

  setup(_props, { root }) {
    const homePage = computed(() => {
      if (root.$route.path.startsWith('/answer-test')) {
        return `/answer-test/${
          (root.$store.state['answer-test'] as AnswerTestState).shareLink
        }`
      }

      return '/'
    })

    const errorMessage = computed(() => {
      switch (_props.error.statusCode) {
        case 404:
          return 'Oops! Page not found'
        default:
          return _props.error.message || 'Oops! An error occured!'
      }
    })

    return { homePage, errorMessage }
  },

  head() {
    return {
      title: this.error.statusCode,
      meta: [
        {
          hid: 'description',
          name: 'descrition',
          content: this.errorMessage,
        },
      ],
    }
  },
})
</script>

<template>
  <div class="bg-surface-default px-16 lg:px-0" :class="{ 'hide-ui': !mounted }">
    <Header />

    <div class="grid justify-items-center pt-[7%] text-center w-full">
      <h1 class="sr-only">An error occured!</h1>

      <template v-if="error.statusCode !== 404">
        <h2
          class="text-action-critical-default font-bold text-display-x-large-sm md:text-display-x-large mb-16"
        >
          {{ error.statusCode }}
        </h2>

        <h3
          class="text-text-subdued mb-32 text-display-medium-sm md:text-medium"
        >
          {{ errorMessage }}
        </h3>
      </template>

      <template v-else>
        <h2
          class="font-sf-pro-display text-display-medium-sm mb-[1rem] lg:text-display-medium"
        >
          {{ errorMessage }}
        </h2>

        <Img
          src="/static/png/illustration/404.png"
          alt="404 vector image"
          class="w-[min(90%,370px)] h-246 mb-[1rem]"
        />

        <h3 class="mb-20 max-w-[90%] text-center lg:max-w-[435px] text-heading">
          Looks like page either doesn't exist or was removed. We suggest you go
          back to the hompage
        </h3>
      </template>

      <Button :to="homePage" primary size="large" class="w-full max-w-[558px]">
        Go to homepage
      </Button>
    </div>

    <DelayMount>
      <FeedbackForm />
    </DelayMount>
  </div>
</template>
