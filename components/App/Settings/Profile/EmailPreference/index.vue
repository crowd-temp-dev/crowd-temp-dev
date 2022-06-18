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

interface Form {
  $accountsAndTest: boolean
  $updateAndDeals: boolean
  $sendTips: boolean
}

export default defineComponent({
  name: 'AppSettingsProfileEmailPreference',
  components: { Section, Button },
  mixins: [settings],
  setup(_,) {
    const loading = ref(false)

    const onUpdate: OnSubmit<Form> =  ({  formFields }) => {
      loading.value = true

      disableFormFields(formFields)

      // const { data, error } = await .auth.update({
      //   data: {
      //     emailPreference: {
      //       accountsAndTest: formValues.$accountsAndTest,
      //       updateAndDeals: formValues.$updateAndDeals,
      //       sendTips: formValues.$sendTips,
      //     } as User['emailPreference'],
      //   },
      // })

      enableFormFields(formFields)

      // if (error) {
      //   $pToast.open({
      //     error: true,
      //     message: error.message,
      //   })
      // } else if (data) {
      //   $store.commit('user/LOGIN', {
      //     info: data.user_metadata,
      //   })

      //   $pToast.open({
      //     message: 'Updated!',
      //   })
      // }

      loading.value = false
    }

    return {
      loading,
      onUpdate,
    }
  },
})
</script>

<template>
  <Section title="Email preferences">
    <FormLayout
      :key="$user.key"
      v-slot="{ fieldIdAndError }"
      name="email-preference"
      watch-changes
      @form-changed="formChanged"
      @form-revert="formRevert"
      @on-submit="onUpdate"
    >
      <Checkbox
        v-bind="fieldIdAndError('$accountsAndTest')"
        label="Send me emails about my accounts and tests"
        disabled
        checked
      />

      <Checkbox
        v-bind="fieldIdAndError('$updateAndDeals')"
        label="Send me emails about products updates and special deals"
        :checked="
          $user.emailPreference ? $user.emailPreference.updateAndDeals : false
        "
      />

      <Checkbox
        v-bind="fieldIdAndError('$sendTips')"
        label="Send me tips on how to get the best out of crowd"
        :checked="
          $user.emailPreference ? $user.emailPreference.sendTips : false
        "
      />
    </FormLayout>

    <template #cta>
      <Button
        primary
        type="submit"
        form="email-preference"
        :disabled="!changed"
        :loading="loading"
      >
        Save changes
      </Button>
    </template>
  </Section>
</template>
