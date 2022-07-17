<script lang="ts">
import { defineComponent, onBeforeUnmount, ref } from '@vue/composition-api'
import { dynamicPageTransition } from '@/utils/pageTransition'
import { ResendVerificationEmail } from '~/services/user'
import { showToasts } from '~/utils/showToast'

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

  setup(_, { root: { $store, $axios, $user, $pToast, $router } }) {
    const resending = ref(false)

    const resendEmail = async () => {
      if (!$user.id) {
        $router.replace('/auth/sign-up')

        return
      }

      resending.value = true

      $pToast.open({
        message: 'Resending email...',
      })

      const { message } = await ResendVerificationEmail($axios, $user.id)

      showToasts($pToast, message)

      resending.value = false
    }

    onBeforeUnmount(() => {
      $store.commit('user/setPublic', {})
    })

    return { resending, resendEmail }
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
            class="text-action-primary-default can-hover:hover:text-action-primary-hovered can-hover:hover:underline active:opacity-70 transition-opacity cursor-pointer inline-flex"
            :class="{ 'grayscale opacity-70 pointer-events-none': resending }"
          >
            resend email.
          </label>

          <button :id="id" class="sr-only" @click="resendEmail">
            resend email
          </button>
        </p>
      </Id>
    </div>
  </main>
</template>
