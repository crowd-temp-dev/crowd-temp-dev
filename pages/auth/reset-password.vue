<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api'
import { dynamicPageTransition } from '@/utils/pageTransition'
import Auth from '~/components/LandingPage/Auth/index.vue'
import Button from '~/components/Base/Button/index.vue'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'
import PasswordField from '~/components/Base/PasswordField/index.vue'
import ConfirmPasswordField from '~/components/Base/ConfirmPasswordField/index.vue'
import { OnSubmit } from '~/types'
import {
  disableFormFields,
  enableFormFields,
} from '~/components/Base/FormLayout/utils'
import { ResetPassword, ResetPasswordPage } from '~/services/user'
import { ResetPasswordForm } from '~/server-middleware/routes/user/reset-password'
import { showToasts } from '~/utils/showToast'
import { sleep } from '~/utils'

export default defineComponent({
  name: 'ResetPasswordPage',
  components: {
    Auth,
    Button,
    FadeTransition,
    PasswordField,
    ConfirmPasswordField,
  },

  transition: (to, from) =>
    dynamicPageTransition({
      to,
      from,
      useFade: /login|sign-up|forgot-password|reset-password/.test(
        from?.path || ''
      ),
    }),

  setup(_, { root: { $pToast, $user, $axios, $router } }) {
    const showSuccessScreen = ref(false)

    const password = ref('')

    const subtitle = computed(() => {
      return showSuccessScreen.value
        ? `Your password has been successfully reset. Click the “continue” button below to log in magically!`
        : `Your new password must be different form previously used passwords`
    })

    const resetPassword: OnSubmit<ResetPasswordForm> = async ({
      formValues,
      toggleLoading,
      formFields,
    }) => {
      toggleLoading?.(true)

      disableFormFields(formFields)

      const { error, message } = await ResetPassword($axios, formValues)

      enableFormFields(formFields)

      if (error) {
        showToasts($pToast, message)
      } else {
        showSuccessScreen.value = true
      }

      toggleLoading?.(false)
    }

    const autoLogin: OnSubmit<{}> = async ({ toggleLoading }) => {
      toggleLoading?.(true)

      const { data, message } = await $user.reload()

      if (data) {
        await sleep()

        $router.replace('/')
      }

      showToasts($pToast, message)

      toggleLoading?.(false)
    }

    return { showSuccessScreen, subtitle, password, resetPassword, autoLogin }
  },

  async fetch({ $axios, route, redirect, error }) {
    const { error: resError, status } = await ResetPasswordPage($axios, {
      token: route.query.token as string,
    })

    if (resError) {
      if (error && /403|404/.test(`${status}`)) {
        redirect({
          query: {
            token: undefined,
          },
        })

        error({
          message: 'Invalid token!',
          statusCode: 403,
        })
      }
    }
  },

  head: {
    title: 'Reset password',
    meta: [
      {
        hid: 'description',
        content: 'Set a new password',
        name: 'description',
      },
    ],
  },
})
</script>

<template>
  <FadeTransition>
    <main :key="`${showSuccessScreen}`" class="isolate">
      <h2
        class="text-[18px] leading-[24px] md:text-[26px] md:leading-[32px] font-sf-pro-display mb-16 text-center mx-16 md:mx-auto"
      >
        {{
          showSuccessScreen ? 'Password reset successful!' : 'Set new password'
        }}
      </h2>

      <Auth plain>
        <p class="text-semibold mb-20 text-[16px] leading-[24px]">
          {{ subtitle }}
        </p>

        <template v-if="showSuccessScreen">
          <FormLayout
            v-slot="{ loading }"
            name="auto-login"
            @on-submit="autoLogin"
          >
            <Button
              full-width
              primary
              class="mb-20"
              type="submit"
              size="large"
              :loading="loading"
            >
              Continue
            </Button>
          </FormLayout>
        </template>

        <template v-else>
          <FormLayout
            v-slot="{ fieldIdAndError, loading }"
            name="reset-password"
            @on-submit="resetPassword"
          >
            <PasswordField
              v-model="password"
              help-text="At least 8 characters with a min of one special character, one uppercase and one number."
              v-bind="fieldIdAndError('password')"
            />

            <ConfirmPasswordField
              :password="password"
              label="Confirm password"
              v-bind="fieldIdAndError('confirmPassword')"
            />

            <Button
              type="submit"
              full-width
              primary
              class="mb-24"
              size="large"
              :loading="loading"
            >
              Reset password
            </Button>
          </FormLayout>
        </template>

        <Button
          plain
          icon="ArrowLeftMinor"
          to="/auth/login"
          size="large"
          class="mt-16"
        >
          Back to login
        </Button>
      </Auth>
    </main>
  </FadeTransition>
</template>
