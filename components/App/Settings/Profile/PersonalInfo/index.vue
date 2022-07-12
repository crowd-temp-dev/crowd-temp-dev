<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import { OnSubmit } from '~/types'
import Section from '~/components/App/Settings/Section/index.vue'
import Button from '~/components/Base/Button/index.vue'
import {
  disableFormFields,
  enableFormFields,
} from '~/components/Base/FormLayout/utils'
import settings from '~/mixins/settings'
import { UserData, UserRole } from '~/server-middleware/types'
import { showToasts } from '~/utils/showToast'

interface Form {
  name: string
  email: string
  role: string
}

export default defineComponent({
  name: 'AppSettingsProfilePersonalInformation',
  components: { Section, Button },
  mixins: [settings],
  setup(_, { root: { $user, $pToast } }) {
    const firstName = ref($user.firstName)

    const lastName = ref($user.lastName)

    const email = ref($user.email)

    const loading = ref(false)

    const formChanged = ref(false)

    const onUpdate: OnSubmit<Form> = async ({ formFields, formValues }) => {
      loading.value = true

      disableFormFields(formFields)

      const { message } = await $user.update(formValues as unknown as UserData)

      enableFormFields(formFields)

      showToasts($pToast, message)

      loading.value = false
    }

    const roleOptions: { label: string; value: UserRole }[] = [
      {
        label: 'User',
        value: 'user',
      },
      {
        label: 'Tester',
        value: 'tester',
      },
    ]

    return {
      email,
      firstName,
      lastName,
      loading,
      onUpdate,
      roleOptions,
      formChanged,
    }
  },
})
</script>

<template>
  <Section title="Personal information">
    <FormLayout
      :key="`${$user.key}`"
      v-slot="{ fieldIdAndError }"
      name="personal-info"
      watch-changes
      @form-changed="formChanged = true"
      @form-revert="formChanged = false"
      @on-submit="onUpdate"
    >
      <div class="grid gap-x-20 grid-cols-2">
        <TextField
          v-model="firstName"
          v-bind="fieldIdAndError('firstName')"
          label="First name"
          required
        />

        <TextField
          v-model="lastName"
          v-bind="fieldIdAndError('lastName')"
          label="Last name"
          required
        />
      </div>

      <TextField
        v-model="email"
        type="email"
        label="Email"
        :disabled="$user.provider !== 'email'"
        v-bind="fieldIdAndError('email')"
        required
      />

      <Select
        required
        mandatory
        label="Role"
        placement="bottom-start"
        :value="$user.role"
        :options="roleOptions"
        v-bind="fieldIdAndError('role')"
      />
    </FormLayout>

    <template #cta>
      <Button primary type="submit" form="personal-info" :loading="loading">
        Save changes
      </Button>
    </template>
  </Section>
</template>
