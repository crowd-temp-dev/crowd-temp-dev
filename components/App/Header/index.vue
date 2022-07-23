<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import Search from './Search/index.vue'
import HelpButton from './HelpButton/index.vue'
import ProfileButton from './ProfileButton/index.vue'
import Notification from './Notification/index.vue'
import HeaderLogo from '~/components/Base/HeaderLogo/index.vue'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'

export default defineComponent({
  name: 'AppHeader',
  components: {
    HeaderLogo,
    Search,
    ProfileButton,
    HelpButton,
    Notification,
    FadeTransition,
  },
  setup() {
    const searchField = ref('')

    return { searchField }
  },
})
</script>

<template>
  <FadeTransition :duration="{ leave: 100 }">
    <header :key="$user.onboarded" class="Header">
      <HeaderLogo class="z-1 relative" />

      <Search v-if="$user.onboarded" />

      <div
        class="fill-icon-default flex space-x-10 shrink-0 items-center"
        :class="{ 'justify-end': !$user.onboarded }"
      >
        <Notification v-if="$user.onboarded" />

        <HelpButton v-if="$user.onboarded" />

        <ProfileButton />
      </div>
    </header>
  </FadeTransition>
</template>

<style scoped lang="postcss">
.Header {
  @apply shadow-2 bg-surface-default px-16 h-56 w-full grid justify-between items-center row-start-1 col-start-1 col-end-3 relative z-2 grid-flow-col isolate;
  grid-template-columns: calc(var(--sidebar-width) - 16px) 1fr auto;
}
</style>
