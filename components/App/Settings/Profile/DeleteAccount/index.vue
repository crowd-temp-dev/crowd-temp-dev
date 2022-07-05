<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api'
import Section from '~/components/App/Settings/Section/index.vue'
import Button from '~/components/Base/Button/index.vue'
import DialogButton from '~/components/Base/DialogButton/index.vue'
import { confirmDeleteAccount } from '~/utils'
import PasswordField from '~/components/Base/PasswordField/index.vue'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'
import { OnSubmit } from '~/types'
import { DeleteAccountForm } from '~/server-middleware/routes/user/delete-account'
import {
  disableFormFields,
  enableFormFields,
} from '~/components/Base/FormLayout/utils'

export default defineComponent({
  name: 'AppSettingsProfileDeleteAccount',
  components: { Section, Button, DialogButton, PasswordField, FadeTransition },
  setup(_, { root: { $user } }) {
    const confirmField = ref('')

    const loading = ref(false)

    const confirmed = computed(
      () => confirmField.value === confirmDeleteAccount
    )

    const deleteAccount: OnSubmit<DeleteAccountForm> = async ({
      formValues,
      formFields,
    }) => {
      loading.value = true

      disableFormFields(formFields)

      await $user.delete(formValues)

      formFields.password.value = ''

      enableFormFields(formFields)

      loading.value = false
    }

    return {
      confirmField,
      confirmDeleteAccount,
      confirmed,
      deleteAccount,
      loading,
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
            @on-submit="deleteAccount"
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
                v-if="confirmed"
                autofocus
                required
                label="Password*"
                v-bind="fieldIdAndError('password')"
              />
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
              :disabled="!confirmed"
              :loading="loading"
            >
              Delete account
            </Button>
          </div>
        </template>
      </DialogButton>
    </template>
  </Section>
</template>
