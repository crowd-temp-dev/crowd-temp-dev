<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api'
import Button from '~/components/Base/Button/index.vue'
import HeaderLogo from '~/components/Base/HeaderLogo/index.vue'
import { scrollToLandingPageHash, sleep } from '~/utils'

interface Link {
  title:
    | 'Use cases'
    | 'Features'
    | 'Pricing'
    | 'Contact'
    | 'Try our beta for free'
  button?: boolean
  to: string
  onClick?: () => void
}

export default defineComponent({
  name: 'LandingPageHeader',
  components: { Button, HeaderLogo },
  setup(_, { root }) {
    const useCases = '/#use-cases'
    const featuresTo = '/#features'
    const pricingTo = '/#pricing'
    const contactTo = '/#contact'

    const scrollToHash = (hash: string) => {
      sleep().then(() => {
        root.$route.path === '/' &&
          scrollToLandingPageHash(hash.replace('/', ''), true)
      })
    }

    const links = ref<Link[]>([
      {
        title: 'Use cases',
        to: useCases,
        onClick: () => scrollToHash(useCases),
      },
      {
        title: 'Features',
        to: featuresTo,
        onClick: () => scrollToHash(featuresTo),
      },
      {
        title: 'Pricing',
        to: pricingTo,
        onClick: () => scrollToHash(pricingTo),
      },
      {
        title: 'Contact',
        to: contactTo,
        onClick: () => scrollToHash(contactTo),
      },
      {
        title: 'Try our beta for free',
        to: '/auth/sign-up',
        button: true,
      },
    ])

    const mobileAuthPage = computed(
      () =>
        /^\/auth\/(?:login|sign-up)/.test(root.$route.path) &&
        root.$breakpoint.isMobile
    )
    return {
      links,
      mobileAuthPage,
    }
  },
})
</script>

<template>
  <header
    id="landing-page-header"
    class="lg:shadow-2 lg:sticky lg:top-0 z-10 bg-surface-default px-8 md:px-20"
    :class="{
      // make header sticky for auth pages
      'shadow-2 sticky top-0 z-10 bg-surface-default': mobileAuthPage,
      'lg:not-supports-backdrop-filter:bg-surface-default lg:supports-backdrop-filter:bg-surface-default/80 lg:supports-backdrop-filter:backdrop-blur-xl':
        $route.name !== 'privacy-and-policy',
    }"
  >
    <div
      class="max-w-[1110px] flex items-center justify-between mx-auto md:h-58 md:pt-0"
      :class="{
        // make header sticky for auth pages
        'h-60 px-10': mobileAuthPage,
        'pt-22': !mobileAuthPage,
      }"
    >
      <HeaderLogo />

      <nav
        v-if="
          !$breakpoint.isMobile &&
          (!$user.loggedIn ||
            ($user.loggedIn && $route.name !== 'auth-account-confirmed'))
        "
      >
        <ul class="flex items-center space-x-10">
          <li
            v-for="link in links"
            :key="link.title"
            :class="{
              'h-28 py-4 px-8 rounded flex items-center justify-center text-button font-medium':
                !link.button,
            }"
          >
            <Button
              v-if="link.button"
              :to="$user.loggedIn ? '/dashboard' : link.to"
              :primary="!$user.loggedIn"
            >
              {{ $user.loggedIn ? 'Dashboard' : link.title }}
            </Button>

            <NuxtLink
              v-else
              :to="link.to"
              class="transition-opacity active:opacity-70"
              @click.native="link.onClick"
            >
              {{ link.title }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <Button
        v-else-if="!$breakpoint.isMobile && $user.loggedIn"
        to="/dashboard"
      >
        Dashboard
      </Button>
    </div>
  </header>
</template>
