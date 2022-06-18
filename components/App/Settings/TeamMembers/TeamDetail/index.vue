<template>
  <Section title="Team" hide-footer>
    <!-- <header> -->
    <div class="flex space-x-10 items-end min-w-full">
      <TextField
        label="Invite new team member"
        placeholder="member@email.com"
        type="email"
        class="shrink-0 flex-grow max-w-[488px]"
      />

      <Select
        value="Select role"
        :options="[{ label: 'Select role', value: 'initial' }]"
        class="shrink-0 flex-grow max-w-[180px]"
      />

      <Button disabled class="shrink-0"> Invite </Button>
    </div>
    <!-- </header> -->

    <SearchField
      outlined
      placeholder="Search team member"
      class="mt-22 mb-20 max-w-[270px]"
    />

    <!-- <table> -->
    <table class="w-full">
      <thead class="h-60 shadow-divide-bottom">
        <tr>
          <th
            v-for="(th, i) in tableHead"
            :key="th"
            class="font-normal"
            :class="{
              'text-right': i === 3,
              'text-left': i !== 3,
            }"
          >
            {{ th }}
          </th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="(td, i) in tableBody"
          :key="td.name"
          class="h-60"
          :class="{ 'shadow-divide-bottom': i !== tableBody.length - 1 }"
        >
          <td>
            {{ td.name }}
            <PBadge v-if="td.admin" class="ml-10 bg-surface-highlight-default"
              >Admin</PBadge
            >
          </td>

          <td>
            <time>
              {{ td.lastActive }}
            </time>
          </td>

          <td>
            {{ td.role }}
          </td>

          <td class="float-right h-60">
            <div class="h-full w-full flex-centered">
              <PIcon source="HorizontalDotsMinor" class="fill-icon-default" />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <!-- </table> -->
  </Section>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import Section from '../../Section/index.vue'
import Button from '../../../../Base/Button/index.vue'
import SearchField from '~/components/Base/SearchField/index.vue'

type TableHead = 'Team member' | 'Last active' | 'Role' | 'Actions'

interface TableBodyRow {
  name: string
  admin?: boolean
  lastActive: string
  role: 'Designer' | 'Product Manager'
  // actions?:[]
}

export default defineComponent({
  name: 'AppSettingsTeamMembersTeamDetail',
  components: { Section, Button, SearchField },
  setup() {
    const tableHead: TableHead[] = [
      'Team member',
      'Last active',
      'Role',
      'Actions',
    ]

    const tableBody: TableBodyRow[] = [
      {
        name: 'Joe Sleek',
        admin: true,
        lastActive: '31/01/22',
        role: 'Designer',
      },
      {
        name: 'Iveren Agbo',
        lastActive: '31/01/22',
        role: 'Product Manager',
      },
    ]

    return { tableHead, tableBody }
  },
})
</script>

<style scoped></style>
