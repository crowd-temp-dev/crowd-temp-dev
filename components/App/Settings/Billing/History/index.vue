<template>
  <section class="bg-surface-default shadow-2 p-20 rounded-lg w-full">
    <div class="flex items-center justify-between mb-20">
      <h3 class="text-heading font-semibold">Billing history</h3>

      <Button @click="showDetails = !showDetails"> Export history </Button>
    </div>

    <FadeTransition>
      <p
        v-if="!showDetails"
        class="h-40 px-10 rounded-[3px] bg-action-primary-disabled border border-divider font-semibold text-text-subdued flex items-center"
      >
        No payment has been made yet
      </p>

      <table v-else class="w-full">
        <thead class="h-52 shadow-divide-bottom">
          <tr>
            <th
              v-for="(th, i) in tableHead"
              :key="th"
              class="font-normal text-left"
              :class="{ 'pl-16': i === 0 }"
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
            <td class="w-full max-w-[47.5%] pl-16">
              <div class="inline-flex">
                <PIcon source="ReceiptMajor" class="fill-icon-default" />

                <span class="ml-12">
                  {{ td.label }}
                </span>
              </div>
            </td>

            <td class="w-112">
              <span> ${{ td.amount }} </span>
            </td>

            <td class="w-75">
              <PBadge class="bg-surface-success-default">
                {{ td.date }}
              </PBadge>
            </td>

            <td class="w-100">
              {{ td.plan }}
            </td>

            <td>
              <Button> Download </Button>
            </td>
          </tr>
        </tbody>
      </table>
    </FadeTransition>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import Button from '@/components/Base/Button/index.vue'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'

type TableHead = 'Label' | 'Amount' | 'Status' | 'Plan' | 'Action'

interface TableBodyRow {
  label: string
  amount: `${number}`
  date: string
  plan: 'Basic Plan'
}

export default defineComponent({
  name: 'AppSettingsBillingsHistory',
  components: { Button, FadeTransition },

  setup() {
    const showDetails = ref(true)

    const tableHead: TableHead[] = [
      'Label',
      'Amount',
      'Status',
      'Plan',
      'Action',
    ]

    const tableBody: TableBodyRow[] = [
      {
        label: 'Pro plan - June 2022',
        amount: '49.00',
        date: 'Paid',
        plan: 'Basic Plan',
      },
      {
        label: 'Pro plan - June 2022',
        amount: '49.00',
        date: 'Paid',
        plan: 'Basic Plan',
      },
    ]

    return { showDetails, tableHead, tableBody }
  },
})
</script>
