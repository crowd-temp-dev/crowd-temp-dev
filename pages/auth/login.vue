<script lang="ts">
import { computed, defineComponent, onMounted, ref } from '@vue/composition-api'
import { dynamicPageTransition } from '@/utils/pageTransition'
import Auth from '~/components/LandingPage/Auth/index.vue'
import Button from '~/components/Base/Button/index.vue'
import PasswordField from '~/components/Base/PasswordField/index.vue'
import { OnSubmit } from '~/types'
import {
  disableFormFields,
  enableFormFields,
} from '~/components/Base/FormLayout/utils'
import { LoginPayload } from '~/store/user'
import { googleOAuthUrl } from '~/utils/oauth/google'
import { showServerAuthMessage } from '~/utils'

export default defineComponent({
  name: 'LoginPage',
  components: { Auth, Button, PasswordField },

  transition: (to, from) =>
    dynamicPageTransition({
      to,
      from,
      useFade: /login|sign-up|forgot-password|reset-password/.test(
        from?.path || ''
      ),
    }),

  setup(_, { root: { $user, $nuxt, $pToast, $cookies } }) {
    const formKey = ref(0)

    const focusOn = ref($cookies.get('signup_focus'))

    const password = ref('Qwerty$2')

    const rememberCheckbox = ref(true)

    const attemptLogin: OnSubmit<LoginPayload> = async ({
      formValues,
      formFields,
      toggleLoading,
    }) => {
      toggleLoading?.(true)

      disableFormFields<LoginPayload>(formFields)

      await $user.login({
        ...formValues,
        remember: formValues.remember,
      })

      // clear password field
      password.value = ''

      enableFormFields<LoginPayload>(formFields)

      toggleLoading?.(false)
    }

    const getGoogleOAuthUrl = computed(() => {
      return googleOAuthUrl($nuxt.context.env)
    })

    // show server error
    onMounted(() => {
      showServerAuthMessage('login', $pToast, $cookies)
    })

    return {
      formKey,
      password,
      rememberCheckbox,
      getGoogleOAuthUrl,
      focusOn,
      attemptLogin,
    }
  },

  head: {
    title: 'Login',
    meta: [
      {
        hid: 'description',
        content: 'login to your account',
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
      Welcome back to Crowd
    </h2>

    <Auth>
      <template #header>
        <p>
          Don't have an account?
          <NuxtLink to="sign-up" class="text-action-primary-default"
            >Signup</NuxtLink
          >
        </p>
      </template>

      <template #socials>
        <Button
          :size="$breakpoint.isMobile ? 'large' : 'medium'"
          :full-width="$breakpoint.isMobile"
          :href="getGoogleOAuthUrl"
          :autofocus="focusOn === 'google'"
        >
          <div class="flex items-center">
            <Img
              src="static/png/icon/google"
              alt="Google logo"
              :width="19"
              :height="19"
              class="w-19 h-19 mr-4"
            />

            Login with Google
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

            Login with Twitter
          </div>
        </Button>
      </template>

      <h3
        class="text-heading font-semibold mb-20 flex justify-between items-center"
      >
        Login with email

        <NuxtLink
          v-if="!$breakpoint.isMobile"
          class="text-action-primary-default font-normal"
          to="/auth/forgot-password"
          >Forgot password?</NuxtLink
        >
      </h3>

      <FormLayout
        :key="formKey"
        v-slot="{ fieldIdAndError, loading }"
        name="login"
        @on-submit="attemptLogin"
      >
        <TextField
          label="Email address"
          type="email"
          v-bind="fieldIdAndError('email')"
          required
          :autofocus="!$breakpoint.isMobile"
          value="fakeuser@unbug.crowd"
        />

        <PasswordField
          v-model="password"
          help-text="At least 8 characters with a min of one special character, one uppercase and one number."
          v-bind="fieldIdAndError('password')"
          required
        />

        <NuxtLink
          v-if="$breakpoint.isMobile"
          class="text-action-primary-default font-normal"
          to="#"
          >Forgot password?</NuxtLink
        >

        <Checkbox
          id="remember"
          v-model="rememberCheckbox"
          label="Remember me"
        />

        <Button
          primary
          full-width
          type="submit"
          size="large"
          :loading="loading"
        >
          Login
        </Button>
      </FormLayout>
    </Auth>
  </main>
</template>
