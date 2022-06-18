
<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api'
import { dynamicPageTransition } from '@/utils/pageTransition'
import Auth from '~/components/Form/Auth/index.vue'
import Button from '~/components/Base/Button/index.vue'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'
import { OnSubmit } from '~/types'
import {
  disableFormFields,
  enableFormFields,
} from '~/components/Base/FormLayout/utils'
import { ForgotPassword } from '~/services/auth'
import { showToasts } from '~/utils/showToast'

interface Form {
  email: string
}

export default defineComponent({
  name: 'ForgotPasswordPage',
  components: { Auth, Button, FadeTransition },

  transition: (to, from) =>
    dynamicPageTransition({
      to,
      from,
      useFade: /login|sign-up|forgot-password|reset-password/.test(
        from?.path || ''
      ),
    }),

  setup(_, { root: { $pToast, $axios } }) {
    const showSentScreen = ref(false)

    const email = ref('')

    const subtitle = computed(() => {
      return showSentScreen.value
        ? `We sent a password reset link to ${email.value}`
        : `No worries, we'll send you reset instructions`
    })

    const sendRecoveryLink: OnSubmit<Form> = async ({
      formValues: form,
      formFields,
      toggleLoading,
    }) => {
      toggleLoading?.(true)

      formFields && disableFormFields<Form>(formFields)

      const { data, error, message } = await ForgotPassword($axios, form)

      formFields && enableFormFields<Form>(formFields)

      if (error) {
        showToasts($pToast, message)
      } else if (data) {
        showSentScreen.value = true

        scrollTo({
          top: 0,
          behavior: 'smooth',
        })
      }

      toggleLoading?.(false)
    }

    const resendVerification = () => {
      showSentScreen.value = false

      email.value = ''
    }

    return {
      showSentScreen,
      subtitle,
      sendRecoveryLink,
      email,
      resendVerification,
    }
  },

  head: {
    title: 'Forgot password',
    meta: [
      {
        hid: 'description',
        content: 'Forgot password? Easily recover your password.',
        name: 'description',
      },
    ],
  },
})
</script>

<template>
  <FadeTransition :duration="{ enter: 400, leave: 250 }">
    <main :key="`${showSentScreen}`" class="isolate">
      <h2
        class="text-[18px] leading-[24px] md:text-[26px] md:leading-[32px] font-sf-pro-display mb-16 text-center mx-16 md:mx-auto"
      >
        {{ showSentScreen ? 'Check your email' : 'Forgot password?' }}
      </h2>

      <Auth plain>
        <p class="text-semibold mb-20 text-[16px] leading-[24px]">
          {{ subtitle }}
        </p>

        <template v-if="showSentScreen">
          <Button
            v-if="false"
            full-width
            primary
            class="mb-20"
            to="/auth/reset-password"
          >
            Open email app
          </Button>

          <p class="text-text-subdued mb-24">
            Didn't receive the email?
            <Button plain @click="resendVerification">Click to resend</Button>
          </p>
        </template>

        <template v-else>
          <FormLayout
            v-slot="{ fieldIdAndError, loading }"
            name="forgot-password"
            @on-submit="sendRecoveryLink"
          >
            <TextField
              v-model="email"
              type="email"
              label="Email address"
              required
              v-bind="fieldIdAndError('email')"
              :autofocus="!$breakpoint.isMobile"
            />

            <Button
              type="submit"
              full-width
              primary
              class="mb-24"
              :loading="loading"
            >
              Continue
            </Button>
          </FormLayout>
        </template>

        <Button plain icon="ArrowLeftMinor" to="/auth/login" class="mt-16">
          Back to login
        </Button>
      </Auth>
    </main>
  </FadeTransition>
</template>
