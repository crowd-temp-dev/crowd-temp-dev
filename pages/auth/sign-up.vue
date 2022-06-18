<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import { dynamicPageTransition } from '@/utils/pageTransition'
import Auth from '~/components/Form/Auth/index.vue'
import Button from '~/components/Base/Button/index.vue'
import ConfirmPasswordField from '~/components/Base/ConfirmPasswordField/index.vue'
import PasswordField from '~/components/Base/PasswordField/index.vue'
import { OnSubmit } from '~/types'
import {
  disableFormFields,
  enableFormFields,
} from '~/components/Base/FormLayout/utils'
import { SignUpForm } from '~/server-middleware/routes/user/signup'
import { Signup } from '~/services/auth'
import { showToasts } from '~/utils/showToast'

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

  setup(_, { root: { $pToast, $axios } }) {
    const email = ref('')

    const password = ref('')

    const confirmPassword = ref('')

    const formKey = ref(0)

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

    return {
      email,
      attemptSignup,
      password,
      formKey,
      confirmPassword,
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
          <NuxtLink to="login" class="text-action-primary-default"
            >Login</NuxtLink
          >
        </p>
      </template>

      <template #socials>
        <Button
          :size="$breakpoint.isMobile ? 'large' : 'medium'"
          :full-width="$breakpoint.isMobile"
        >
          <div class="flex items-center">
            <PImage
              source="/png/icon/google.png"
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
            <PImage
              source="/png/icon/twitter.png"
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
        <TextField
          label="Your name"
          required
          v-bind="fieldIdAndError('name')"
          :autofocus="!$breakpoint.isMobile"
        />
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

        <Checkbox
          required
          label="I agree to Crowd's terms and privacy policies"
          v-bind="fieldIdAndError('agreed')"
        />

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
