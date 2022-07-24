<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api'
import Section from '~/components/App/Settings/Section/index.vue'
import Button from '~/components/Base/Button/index.vue'
import DialogButton from '~/components/Base/DialogButton/index.vue'
import { confirmDeleteAccount, oneFrame, sleep } from '~/utils'
import PasswordField from '~/components/Base/PasswordField/index.vue'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'
import { OnSubmit } from '~/types'
import { DeleteAccountForm } from '~/server-middleware/routes/user/delete-account'
import {
  disableFormFields,
  enableFormFields,
} from '~/components/Base/FormLayout/utils'
import { SendDeleteEmailConfirmation } from '~/services/user'
import { showToasts } from '~/utils/showToast'

interface DeleteAccountFormValues extends DeleteAccountForm {
  accountPassword: string
}

export default defineComponent({
  name: 'AppSettingsProfileDeleteAccount',
  components: { Section, Button, DialogButton, PasswordField, FadeTransition },
  setup(_, { root: { $user, $axios, $pToast } }) {
    const confirmField = ref('')

    const confirmationSent = ref(false)

    const sendingConfirmation = ref(false)

    const deleting = ref(false)

    const confirmed = computed(
      () => confirmField.value === confirmDeleteAccount
    )

    const providerConfirmed = computed(() => {
      return $user.provider === 'email' ? true : confirmationSent.value
    })

    const sendConfirmationEmail = async () => {
      confirmationSent.value = false

      sendingConfirmation.value = true

      const { data, message } = await SendDeleteEmailConfirmation($axios, null)

      await sleep(oneFrame)

      showToasts($pToast, message)

      confirmationSent.value = !!data

      sendingConfirmation.value = false
    }

    const confirmOrDeleteAccount: OnSubmit<DeleteAccountFormValues> = async ({
      formValues,
      formFields,
    }) => {
      if (!providerConfirmed.value) {
        sendConfirmationEmail()
      } else {
        deleting.value = true

        disableFormFields(formFields)

        const { accountPassword, token, confirm } = formValues

        await $user.delete({
          token,
          confirm,
          password: accountPassword,
        })

        if ($user.provider === 'email') {
          formFields.accountPassword.value = ''
        } else {
          formFields.token.value = ''
        }

        enableFormFields(formFields)

        deleting.value = false
      }
    }

    const resetForm = () => {
      confirmationSent.value = false
      sendingConfirmation.value = false
      confirmField.value = ''
      deleting.value = false
    }

    return {
      confirmField,
      confirmDeleteAccount,
      confirmed,
      deleting,
      confirmationSent,
      providerConfirmed,
      sendingConfirmation,
      confirmOrDeleteAccount,
      resetForm,
      sendConfirmationEmail,
    }
  },
})
</script>

<template>
  <Section title="Delete account" destructive>
    <p>Delete your account. This process is irreversible</p>

    <template #cta>
      <DialogButton
        destructive
        label="Confirm delete account"
        :dialog-content-class="['min-w-[500px]']"
        :dialog-events="{
          afterLeave: resetForm,
        }"
        @click="confirmField = ''"
      >
        Delete account

        <template #dialog-header>
          <span class="text-text-critical"> Delete account?</span>
        </template>

        <template #dialog>
          <p class="mb-20 text-heading">
            Please note that deleting your account is an irreversible process.
          </p>

          <p class="text-text-highlight mb-20">
            Type "<strong>{{ confirmDeleteAccount }}</strong
            >" below to proceed.
          </p>

          <FormLayout
            v-slot="{ fieldIdAndError }"
            name="delete-account"
            @on-submit="confirmOrDeleteAccount"
          >
            <TextField
              v-model="confirmField"
              autofocus
              required
              :pattern="confirmDeleteAccount"
              v-bind="fieldIdAndError('confirm')"
            />

            <FadeTransition>
              <PasswordField
                v-if="confirmed && $user.provider === 'email'"
                autofocus
                required
                label="Password*"
                v-bind="fieldIdAndError('accountPassword')"
              />

              <div v-else-if="confirmed">
                <Button
                  v-if="!providerConfirmed"
                  primary
                  full-width
                  autofocus
                  form="delete-account"
                  type="submit"
                  :loading="sendingConfirmation"
                >
                  Send email confirmation
                </Button>

                <template v-else>
                  <TextField
                    autofocus
                    required
                    label="Token*"
                    :help-text="`Confirmation token has been sent to '${$user.email}'`"
                    pattern="^\w{6,6}$"
                    v-bind="fieldIdAndError('token')"
                  />

                  <div class="text-center mt-20">
                    <Button plain @click="sendConfirmationEmail">
                      Resend confirmation
                    </Button>
                  </div>
                </template>
              </div>
            </FadeTransition>
          </FormLayout>
        </template>

        <template #dialog-footer="{ close }">
          <div class="flex">
            <Button plain-action @click="close"> Cancel </Button>

            <Button
              type="submit"
              destructive
              form="delete-account"
              class="ml-16"
              :disabled="!confirmed || !providerConfirmed"
              :loading="deleting"
            >
              Delete account
            </Button>
          </div>
        </template>
      </DialogButton>
    </template>
  </Section>
</template>
