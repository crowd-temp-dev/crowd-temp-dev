<script lang="ts">
import { computed, defineComponent, onMounted, ref } from '@vue/composition-api'
import { dynamicPageTransition } from '@/utils/pageTransition'
import Auth from '~/components/LandingPage/Auth/index.vue'
import Button from '~/components/Base/Button/index.vue'
import ConfirmPasswordField from '~/components/Base/ConfirmPasswordField/index.vue'
import PasswordField from '~/components/Base/PasswordField/index.vue'
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
  name: 'SignUpPage',
  components: { Auth, Button, ConfirmPasswordField, PasswordField },

  transition: (to, from) =>
    dynamicPageTransition({
      to,
      from,
      useFade: /login|sign-up|forgot-password|reset-password/.test(
        from?.path || ''
      ),
    }),

  setup(_, { root: { $pToast, $axios, $cookies, $nuxt } }) {
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

    return {
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
    title: 'Sign up',
    meta: [
      {
        hid: 'description',
        content: 'create a new account',
        name: 'description',
      },
    ],
  },
})
</script>

<template>
  <main class="isolate">
    <h2
      class="text-[18px] leading-[24px] md:text-[26px] md:leading-[32px] font-sf-pro-display mb-16 text-center mx-16 md:mx-auto"
    >
      Get started free today, No credit card required
    </h2>

    <Auth>
      <template #header>
        <p>
          Already have an account?
          <NuxtLink
            to="login"
            class="text-action-primary-default transition-opacity active:opacity-70"
            >Login</NuxtLink
          >
        </p>
      </template>

      <template #socials>
        <Button
          :size="$breakpoint.isMobile ? 'large' : 'medium'"
          :full-width="$breakpoint.isMobile"
          :autofocus="focusOn === 'google'"
          :href="getGoogleOAuthUrl"
        >
          <div class="flex items-center">
            <Img
              src="static/png/icon/google"
              alt="Google logo"
              :width="19"
              :height="19"
              class="w-19 h-19 mr-4"
            />

            Sign up with Google
          </div>
        </Button>

        <Button
          :size="$breakpoint.isMobile ? 'large' : 'medium'"
          :full-width="$breakpoint.isMobile"
        >
          <div class="flex items-center">
            <Img
              src="static/png/icon/twitter"
              alt="Twitter logo"
              :width="19"
              :height="19"
              class="w-19 h-19 mr-4"
            />

            Sign up with Twitter
          </div>
        </Button>
      </template>

      <h3 class="text-heading font-semibold mb-20">Sign up with email</h3>

      <FormLayout
        :key="formKey"
        v-slot="{ fieldIdAndError, loading }"
        name="signup"
        @on-submit="attemptSignup"
      >
        <div class="grid gap-20 lg:grid-cols-2">
          <TextField
            label="First name"
            required
            v-bind="fieldIdAndError('firstName')"
            :autofocus="!$breakpoint.isMobile && !focusOn"
          />

          <TextField
            label="Last name"
            required
            v-bind="fieldIdAndError('lastName')"
          />
        </div>

        <TextField
          v-model="email"
          label="Email address"
          type="email"
          required
          v-bind="fieldIdAndError('email')"
        />

        <PasswordField
          v-model="password"
          help-text="At least 8 characters with a min of one special character, one uppercase and one number."
          required
          v-bind="fieldIdAndError('password')"
        />

        <ConfirmPasswordField
          v-model="confirmPassword"
          label="Confirm password"
          :password="password"
          required
          v-bind="fieldIdAndError('confirmPassword')"
        />

        <div class="flex items-center space-x-4">
          <Checkbox
            required
            v-bind="fieldIdAndError('agreed')"
            label="I agree to Crowd's"
          />

          <NuxtLink
            to="/privacy-and-policy"
            class="text-action-primary-default hover:underline"
            target="_blank"
          >
            terms and privacy policies
          </NuxtLink>
        </div>

        <Checkbox
          id="newsUpdate"
          label="I agree to receive Crowd news and updates"
        />

        <Button
          primary
          full-width
          type="submit"
          size="large"
          :loading="loading"
        >
          {{
            $breakpoint.isMobile
              ? 'Create account'
              : 'Create your free account now'
          }}
        </Button>
      </FormLayout>
    </Auth>
  </main>
</template>
