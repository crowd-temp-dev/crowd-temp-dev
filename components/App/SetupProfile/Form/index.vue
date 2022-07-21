<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import RadioGroup from '~/components/Base/RadioGroup/index.vue'
import { OnSubmit } from '~/types'
import { userWorkRole, userCompanySize, userReferrer } from '~/utils'
import { SetupAccountForm } from '~/server-middleware/routes/user/setup-account'
import {
  disableFormFields,
  enableFormFields,
} from '~/components/Base/FormLayout/utils'

interface Select {
  label: string
  value: string
  disabled?: boolean
}

export default defineComponent({
  name: 'AppSetupProfileForm',
  components: { RadioGroup },

  setup(_, { root: { $user } }) {
    const useCases = ['Work', 'Personal', 'Education']

    const roles: Select[] = userWorkRole.map((val) => ({
      label: val,
      value: val,
    }))

    const companySize: Select[] = userCompanySize

    const referrers: Select[] = userReferrer.map((val) => ({
      label: val,
      value: val,
    }))

    const onSubmit: OnSubmit<SetupAccountForm> = async ({
      formValues,
      toggleLoading,
      formFields,
    }) => {
      toggleLoading(true)

      disableFormFields(formFields)

      await $user.setupAccount(formValues)

      toggleLoading(false)

      enableFormFields(formFields)
    }

    return { useCases, roles, companySize, referrers, onSubmit }
  },
})
</script>

<template>
  <FormLayout
    v-slot="{ fieldIdAndError, loading }"
    class="max-w-[558px] w-full"
    name="setup-profile"
    @on-submit="onSubmit"
  >
    <p class="font-sf-pro-display text-display-small">
      Hi {{ $user.firstName }}, tell us a bit about yourself
    </p>

    <p>What will you use crowd for?</p>

    <RadioGroup
      v-bind="fieldIdAndError('useCases')"
      required
      content-class="grid grid-flow-col justify-start gap-32"
    >
      <Radio
        v-for="(item, i) in useCases"
        :key="i"
        :label="item"
        name="useCase"
        :value="item"
        :autofocus="i === 0"
        required
      />
    </RadioGroup>

    <Select
      label="What role best describes you?"
      :options="roles"
      required
      placeholder="Select options"
      v-bind="fieldIdAndError('role')"
    />

    <TextField
      label="What's your company name? (optional)"
      v-bind="fieldIdAndError('companyName')"
    />

    <Select
      label="What's your company size?  (optional)"
      placeholder="Select options"
      :options="companySize"
      v-bind="fieldIdAndError('companySize')"
    />

    <Select
      label="Where did you hear about crowd?"
      placeholder="Select options"
      :options="referrers"
      required
      v-bind="fieldIdAndError('referrer')"
    />

    <Button primary full-width type="submit" size="large" :loading="loading">
      Set up and continue
    </Button>
  </FormLayout>
</template>
