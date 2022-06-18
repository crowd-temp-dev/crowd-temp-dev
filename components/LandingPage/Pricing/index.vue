<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api'
import Button from '~/components/Base/Button/index.vue'
import UiSwitch from '~/components/Base/UiSwitch/index.vue'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'

export type PriceTier = 'Free' | 'Pro' | 'Advanced'

interface Pricing {
  tier: PriceTier
  price: 0 | 49 | 99
  description: string
  features: string[]
  popular?: boolean
}

export default defineComponent({
  name: 'LandingPagePricing',
  components: { Button, UiSwitch, FadeTransition },
  props: {
    settingsPage: Boolean,
    priceTier: {
      type: String as () => PriceTier,
      default: 'Pro',
    },
    billedAnnually: Boolean,
  },
  setup() {
    const billAnnually = ref(false)

    const prices = computed(() => {
      const extraSeat = [
        '2 teams members ($',
        billAnnually.value ? 144 : 12,
        'per extra seat',
      ]

      return [
        {
          tier: 'Free',
          price: 0,
          description: 'For small teams and individual users',
          features: [
            'Create unlimited tests',
            'Up to 50 participants per test',
            '3 test blocks available: Preference test, Simple Survey, Prototype evaluation',
            'Up to 5 notes per test',
            'Email support',
          ],
        },
        {
          tier: 'Pro',
          price: billAnnually.value ? 441 : 49,
          description: 'For growing teams and invididual power users',
          features: [
            'All test blocks are available',
            'Custom branding',
            'Export reports',
            extraSeat,
            'Redirect after tests',
            'Invite up to 250  participants',
            'Create unlimited tests',
            'Up to 25 notes per test',
            'Live chat and email support',
          ],
          popular: true,
        },
        {
          tier: 'Advanced',
          price: billAnnually.value ? 891 : 99,
          description: 'Great for growing startups and corporates',
          features: [
            'Session recordings',
            'Survey demographics',
            'Unlimited notes',
            'Invite unlimited participants',
            'All test blocks are available',
            extraSeat,
            'Create unlimited tests',
            'Custom branding',
            'Redirect after tests',
            'Priority support',
          ],
        },
      ] as Pricing[]
    })
    return {
      prices,
      billAnnually,
    }
  },
})
</script>

<template>
  <section :class="{ 'mb-80 md:mb-100': !settingsPage }">
    <h2
      v-if="!settingsPage"
      id="pricing"
      class="landing-page-title mb-8 md:mb-24"
    >
      Affordable pricing
    </h2>

    <div
      :class="{
        'flex items-center justify-between': settingsPage,
      }"
    >
      <h3
        v-if="!settingsPage"
        class="landing-page-subtitle w-248 md:w-fit mb-24 md:mb-32"
      >
        Get started with our free plan now and try it out
      </h3>

      <h3 v-else class="text-heading font-semibold">Payment plans</h3>

      <div
        class="grid justify-center"
        :class="{ '-translate-x-32': settingsPage }"
      >
        <span
          class="justify-self-end inline-block h-32 text-[#008060] font-bold text-[13px] leading-[20px] translate-x-32 translate-y-4"
        >
          25% off!
        </span>

        <label
          :aria-label="`Bill ${billAnnually ? 'Annually' : 'Monthly'}`"
          for="billing-plan-switch"
          class="flex items-center space-x-6 cursor-pointer"
          :class="{ 'mb-32': !settingsPage, 'mb-20': settingsPage }"
        >
          <strong> Monthly </strong>
          <UiSwitch
            id="billing-plan-switch"
            v-model="billAnnually"
            always-filled
          />
          <strong class="flex relative">
            Annual
            <PImage
              source="/png/landing-page/pricing/vector-curve.png"
              class="h-16 w-24 -mt-8"
            />
          </strong>
        </label>
      </div>
    </div>

    <ul
      class="font-sf-pro-display flex flex-wrap md:flex-nowrap space-y-24 md:space-y-0 md:space-x-38 mx-auto w-full md:w-fit"
    >
      <li
        v-for="price in prices"
        :key="price.tier"
        class="rounded-[10px] p-20 pb-60 w-full h-fit"
        :class="{
          'bg-surface-selected-default': price.popular,
          'bg-white md:border md:border-surface-selected-pressed':
            !price.popular,
          'md:w-300': !settingsPage,
        }"
      >
        <p
          class="font-sf-pro-display text-display-large font-semibold mb-16"
          :class="{
            'text-base-primary': !price.popular,
          }"
        >
          {{ price.tier }}

          <span
            v-if="price.popular"
            class="py-2 px-8 inline-flex h-23 items-center bg-surface-success-default rounded-full text-[13px] leading-[16px] font-normal"
          >
            Most popular
          </span>
        </p>

        <div class="h-32 mb-16">
          <FadeTransition>
            <p
              :key="price.price"
              class="absolute text-display-large font-semibold"
            >
              ${{ price.price
              }}<span
                v-if="price.price"
                class="text-text-subdued text-heading font-normal"
                >&nbsp;/{{ billAnnually ? 'year' : 'month' }}</span
              >
            </p>
          </FadeTransition>
        </div>

        <h6
          class="text-display-small mb-16"
          :class="{
            'text-text-subdued': !price.popular,
          }"
        >
          {{ price.description }}
        </h6>

        <Button
          v-if="settingsPage"
          :primary="price.popular"
          size="large"
          to="#"
          class="mb-16"
          :disabled="
            priceTier === price.tier &&
            (billedAnnually === billAnnually || priceTier === 'Free')
          "
        >
          <FadeTransition>
            <div
              :key="
                priceTier === 'Free'
                  ? 'no-key'
                  : priceTier === price.tier && billedAnnually === billAnnually
              "
            >
              {{
                priceTier === price.tier
                  ? `${
                      billedAnnually === billAnnually || priceTier === 'Free'
                        ? 'Current plan'
                        : 'Upgrade plan'
                    }`
                  : `Get started ${
                      !price.price ? 'for free' : 'with 7 day trial'
                    }`
              }}
            </div>
          </FadeTransition>
        </Button>

        <ul>
          <li
            v-for="(feature, i) in price.features"
            :key="i"
            class="flex items-center justify-start space-x-8 w-fit mb-16"
          >
            <PIcon
              source="TickMinor"
              class="text-[#BABFC3] text-[16px] shrink-0 fill-icon"
            />

            <div
              v-if="Array.isArray(feature)"
              class="text-[18px] leading-[26.66px]"
            >
              <FadeTransition
                v-for="(dynamicFeature, dynamicFeatureIndex) in feature"
                :key="dynamicFeatureIndex"
              >
                <span :key="dynamicFeature" class="inline-block">
                  {{ dynamicFeature }}
                </span>
              </FadeTransition>
            </div>

            <div v-else class="text-[18px] leading-[26.66px]">
              {{ feature }}
            </div>
          </li>
        </ul>

        <Button
          v-if="!settingsPage"
          :primary="price.popular"
          size="large"
          to="#"
        >
          Get started
          {{ !price.price ? 'for free' : 'with 7 day trial' }}
        </Button>
      </li>
    </ul>
  </section>
</template>
