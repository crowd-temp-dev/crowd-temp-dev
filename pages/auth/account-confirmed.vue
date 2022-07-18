<script lang="ts">
import {
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  ref,
} from '@vue/composition-api'
import { dynamicPageTransition } from '@/utils/pageTransition'
import { ConfirmAccount } from '~/services/user'
import { uid } from '~/utils'
import { routeQuery } from '~/server-middleware/utils'

export default defineComponent({
  name: 'AccountConfirmedPage',
  components: {},

  transition: (to, from) =>
    dynamicPageTransition({
      to,
      from,
      useFade: /login|sign-up|forgot-password|reset-password/.test(
        from?.path || ''
      ),
    }),

  setup(
    _,
    {
      root: {
        $axios,
        $route,
        $router,
        $fullscreenLoading,
        $nuxt,
        $store,
        $user,
        $cookies,
      },
    }
  ) {
    const accountConfirmed = ref(false)

    const confirmError = ref('')

    const loadingId = ref(uid())

    const confirmAccount = async () => {
      if (!$route.query.token) {
        if ($user.id) {
          accountConfirmed.value = true

          $cookies.set('remember', 1)
        }

        return
      }

      $fullscreenLoading.show({
        id: loadingId.value,
        message: 'Loading...',
      })

      const { data, message, error, status } = await ConfirmAccount($axios, {
        token: $route.query.token as string,
      })

      $fullscreenLoading.hide({
        id: loadingId.value,
      })

      if (error) {
        const errorMessage = message[0].content

        confirmError.value = errorMessage

        await nextTick()

        $nuxt.error({
          message: errorMessage,
          statusCode: status,
        })
      } else {
        $store.commit('user/setPublic', {
          id: data.id,
          email: data.email,
          name: `${data.firstName} ${data.lastName}`.trim(),
        })

        $route.query.token &&
          $router.replace({
            query: {
              ...$route.query,
              token: undefined,
            },
          })

        accountConfirmed.value = true
      }
    }

    const loginRoute = computed(() => {
      if ($user.loggedIn) {
        return '/dashboard'
      }

      if ($user.email) {
        return `/auth/login?${routeQuery({
          emailAddress: $user.email,
          focusOn: 'password',
        })}`
      }
      return '#'
    })

    confirmAccount()

    onBeforeUnmount(() => {
      $store.commit('user/setPublic', {})
    })

    return { accountConfirmed, confirmError, loginRoute }
  },

  head() {
    return {
      title: this.accountConfirmed
        ? 'Account confirmed!'
        : 'Confirming account...',
      meta: [
        {
          hid: 'description',
          content: 'Confirm your account to get started with Crowd.',
          name: 'description',
        },
      ],
    }
  },
})
</script>

<template>
  <main class="isolate px-10 lg:px-0">
    <div v-if="!accountConfirmed && !confirmError" class="w-full h-full">
      <p class="sr-only">Loading...</p>
    </div>

    <div v-else-if="confirmError">
      <p class="sr-only">
        {{ confirmError }}
      </p>
    </div>

    <template v-else>
      <h2
        class="text-[18px] leading-[24px] md:text-[26px] md:leading-[32px] font-sf-pro-display mb-16 text-center mx-16 md:mx-auto"
      >
        Welcome to Crowd!
      </h2>

      <div class="w-full flex-centered mb-46">
        <Img
          src="/static/png/Illustration/account-created.png"
          alt="Account created illustration"
          class="lg:w-424 lg:h-238 max-w-[min(100%,500px)] lg:max-w-[1000px] w-full"
        />
      </div>

      <div class="max-w-[450px] md:max-w-[558px] mx-auto text-center w-full">
        <p class="mb-20 text-heading">
          Hi {{ $user.name }}, thank you for verifying your account on Crowd!
        </p>

        <Button primary full-width size="large" :to="loginRoute">
          Continue to {{ $user.loggedIn ? 'dashboard' : 'login page' }}
        </Button>
      </div>
    </template>
  </main>
</template>
