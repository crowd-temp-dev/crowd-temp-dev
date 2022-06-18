<template>
  <header class="Header">
    <HeaderLogo />

    <Search />

    <div class="fill-icon-default flex space-x-10 shrink-0">
      <Notification />

      <HelpButton />

      <ProfileButton />
    </div>
  </header>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import Search from './Search/index.vue'
import HelpButton from './HelpButton/index.vue'
import ProfileButton from './ProfileButton/index.vue'
import Notification from './Notification/index.vue'
import HeaderLogo from '~/components/Base/HeaderLogo/index.vue'

export default defineComponent({
  name: 'AppHeader',
  components: { HeaderLogo, Search, ProfileButton, HelpButton, Notification },
  setup() {
    const searchField = ref('')

    return { searchField }
  },
})
</script>

<style scoped lang="postcss">
.Header {
  @apply shadow-2 bg-surface-default px-16 h-56 w-full grid justify-between items-center row-start-1 col-start-1 col-end-3 relative z-2 grid-flow-col;
  grid-template-columns: calc(var(--sidebar-width) - 16px) 1fr auto;
}
</style>
