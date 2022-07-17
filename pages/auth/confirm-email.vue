<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  ref,
} from '@vue/composition-api'
import { dynamicPageTransition } from '@/utils/pageTransition'
import { OnSubmit } from '~/types'
import {
  disableFormFields,
  enableFormFields,
} from '~/components/Base/FormLayout/utils'
import { SignUpForm } from '~/server-middleware/routes/user/signup'
import { Signup } from '~/services/user'
import { showToasts } from '~/utils/showToast'
import { showServerAuthMessage } from '~/utils'
import { googleOAuthUrl } from '~/utils/oauth/google'

export default defineComponent({
  name: 'ConfirmEmailPage',
  components: {},

  transition: (to, from) =>
    dynamicPageTransition({
      to,
      from,
      useFade: /login|sign-up|forgot-password|reset-password/.test(
        from?.path || ''
      ),
    }),

  setup(_, { root: { $pToast, $axios, $cookies, $nuxt, $store } }) {
    const user = ref<Vue['$user']>()

    const focusOn = ref($cookies.get('signup_focus'))

    const email = ref('')

    const password = ref('')

    const confirmPassword = ref('')

    const formKey = ref(0)

    const getGoogleOAuthUrl = computed(() => {
      return googleOAuthUrl($nuxt.context.env)
    })

    const attemptSignup: OnSubmit<SignUpForm> = async ({
      formValues,
      formFields,
      toggleLoading,
      refreshForm,
    }) => {
      $pToast.clear()

      // disable form elements
      disableFormFields<SignUpForm>(formFields)

      toggleLoading?.(true)

      const { message, data } = await Signup($axios, formValues)

      showToasts($pToast, message)

      // enable form elements
      enableFormFields<SignUpForm>(formFields)

      password.value = ''

      confirmPassword.value = ''

      if (data) {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        })

        requestAnimationFrame(() => {
          refreshForm()

          email.value = ''
        })
      }

      // enable form elements
      formFields && enableFormFields<SignUpForm>(formFields)

      toggleLoading?.(false)
    }

    // show server error
    onMounted(() => {
      showServerAuthMessage('signup', $pToast, $cookies)
    })

    onBeforeUnmount(() => {
      $store.commit('user/setPublic', {})
    })

    return {
      user,
      email,
      focusOn,
      password,
      formKey,
      confirmPassword,
      getGoogleOAuthUrl,
      attemptSignup,
    }
  },

  head: {
    title: 'Confirm your email',
    meta: [
      {
        hid: 'description',
        content:
          'Check your inbox or junk folder to get your confirmation message, and next steps.',
        name: 'description',
      },
    ],
  },
})
</script>

<template>
  <main class="isolate px-10 lg:px-0">
    <h2
      class="text-[18px] leading-[24px] md:text-[26px] md:leading-[32px] font-sf-pro-display mb-16 text-center mx-16 md:mx-auto"
    >
      Verify your email
    </h2>

    <div
      class="grid gap-y-20 max-w-[500px] w-full lg:max-w-[616px] rounded-[5px] bg-surface-default p-30 mx-auto text-center lg:text-heading"
    >
      <p>
        Hi <em class="not-italic">{{ $user.name }}</em
        >, an email has been sent to <strong>{{ $user.email }}</strong> with a
        link to verify your account. Kindly click on the link to verify your
        email and continue the registration process.
      </p>

      <Id v-slot="{ id }">
        <p class="text-text-subdued">
          If you've not received an email after a few minutes kindly check your
          spam inbox or
          <label
            :for="id"
            class="text-action-primary-default can-hover:hover:text-action-primary-hovered can-hover:hover:underline active:opacity-70 transition-opacity cursor-pointer"
          >
            resend email.
          </label>

          <button :id="id" class="sr-only">resend email</button>
        </p>
      </Id>
    </div>
  </main>
</template>
