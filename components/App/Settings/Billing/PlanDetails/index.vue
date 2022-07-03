<template>
  <section class="bg-surface-default shadow-2 p-20 rounded-lg w-full">
    <div class="flex items-center justify-between mb-20">
      <h3 class="text-heading font-semibold">Plan Details</h3>

      <Button to="plans" replace @click.prevent="$router.replace('plans')">
        Change Plan
      </Button>
    </div>

    <p class="mb-20">
      You're currently on the
      <NuxtLink to="#" class="text-base-primary"> Free Plan </NuxtLink> billed
      at $0 USD per month. Your next billing date is May 22nd, 2022 at $0 USD
    </p>

    <div class="bg-[#F4F9FF] p-20 rounded-lg">
      <h4 class="text-heading font-semibold mb-8">Get more value!</h4>

      <div class="flex">
        <div class="grid flex-grow">
          <p class="mb-16">
            Our
            <NuxtLink to="#" class="text-base-primary">Pro plan</NuxtLink> gives
            you unlimited tests, custom branding and a lot more premium
            features. Get the best value by upgrading today
          </p>

          <div class="flex items-center">
            <Button primary> Upgrade to Pro plan </Button>

            <Button plain class="ml-12">Learn more</Button>
          </div>
        </div>

        <Img
          alt="vector image"
          src="static/png/app/Settings/Billing/upgrade-vector"
          :height="85"
          class="h-84 min-w-[112px] shrink-0"
        />
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import Button from '@/components/Base/Button/index.vue'

export default defineComponent({
  name: 'AppSettingsBillingsPlanDetails',
  components: { Button },
})
</script>
