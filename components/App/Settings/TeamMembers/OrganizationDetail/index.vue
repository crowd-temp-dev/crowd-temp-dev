<template>
  <Section title="Organization details">
    <PFormLayout>
      <TextField label="Name" />

      <Select
        value="Select an industry"
        :options="[{ label: 'Select an industry', value: 'initial' }]"
        label="Industry"
      />
    </PFormLayout>

    <template #cta>
      <Button primary> Save changes </Button>
    </template>
  </Section>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import Section from '../../Section/index.vue'
import Button from '../../../../Base/Button/index.vue'

export default defineComponent({
  name: 'AppSettingsTeamMembersOrganizationDetail',
  components: { Section, Button },
  setup() {},
})
</script>

<style scoped></style>
