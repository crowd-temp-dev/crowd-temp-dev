<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import Section from '~/components/App/Settings/Section/index.vue'
import Button from '~/components/Base/Button/index.vue'
import settings from '~/mixins/settings'
import PasswordField from '~/components/Base/PasswordField/index.vue'
import ConfirmPasswordField from '~/components/Base/ConfirmPasswordField/index.vue'
import { OnSubmit } from '~/types'
import {
  disableFormFields,
  enableFormFields,
} from '~/components/Base/FormLayout/utils'
import { ChangePasswordForm } from '~/server-middleware/routes/user/change-password'

export default defineComponent({
  name: 'AppSettingsProfileChangePassword',
  components: { Section, Button, PasswordField, ConfirmPasswordField },
  mixins: [settings],
  setup(_, { root: { $user } }) {
    const loading = ref(false)

    const currentPassword = ref('')

    const newPassword = ref('')

    const onUpdate: OnSubmit<ChangePasswordForm> = async ({
      formFields,
      formValues,
      refreshForm,
    }) => {
      loading.value = true

      disableFormFields(formFields)

      await $user.changePassword(formValues)

      enableFormFields(formFields)

      loading.value = false

      newPassword.value = ''

      currentPassword.value = ''

      refreshForm()
    }

    return { currentPassword, newPassword, onUpdate, loading }
  },
})
</script>

<template>
  <Section title="Change password">
    <FormLayout
      v-slot="{ fieldIdAndError }"
      name="change-password"
      watch-changes
      @form-changed="formChanged"
      @form-revert="formRevert"
      @on-submit="onUpdate"
    >
      <PasswordField
        v-model="currentPassword"
        v-bind="fieldIdAndError('currentPassword')"
        label="Current password"
        required
      />

      <PasswordField
        v-model="newPassword"
        :error="
          (currentPassword === newPassword && newPassword)
            ? 'Choose a different password'
            : fieldIdAndError('password').error
        "
        v-bind="fieldIdAndError('password')"
        label="New password"
        required
      />

      <ConfirmPasswordField
        v-bind="fieldIdAndError('confirmPassword')"
        :password="newPassword"
        label="Confirm password"
        required
      />
    </FormLayout>

    <template #cta>
      <Button
        type="submit"
        primary
        :loading="loading"
        form="change-password"
      >
        Save changes
      </Button>
    </template>
  </Section>
</template>
