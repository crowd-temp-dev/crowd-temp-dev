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
    const name = ref($user.name)

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

    return { email, name, loading, onUpdate, roleOptions, formChanged }
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
      <TextField
        v-model="name"
        v-bind="fieldIdAndError('name')"
        label="Full name"
        required
      />

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
