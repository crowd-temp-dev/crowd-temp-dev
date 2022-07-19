<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import Button from '~/components/Base/Button/index.vue'
import { pseudoFocusOnMouseEnter } from '~/utils'
import Dropdown from '~/components/Base/Dropdown/index.vue'
import Tooltip from '~/components/Base/Tooltip/index.vue'

interface DropdownList {
  prependIcon: 'CustomersMajor' | 'ReceiptMajor' | 'ExitMajor'
  title: 'Profile settings' | 'Billing' | 'Logout'
  onClick: () => void
  disabled?: boolean
}

export default defineComponent({
  name: 'AppHeaderProfileButton',
  components: { Button, Dropdown, Tooltip },
  setup(_, { root }) {
    const dropdownList = computed<DropdownList[]>(() => {
      const { $router, $route, $store, $user } = root

      const logout: DropdownList = {
        title: 'Logout',
        prependIcon: 'ExitMajor',
        onClick: () => {
          $store.dispatch('user/logout')
        },
      }

      if (!$user.setupDone) {
        return [logout]
      }

      return [
        {
          prependIcon: 'CustomersMajor',
          title: 'Profile settings',
          onClick: () => {
            $router.push('/dashboard/settings/profile')
          },
          disabled: $route.fullPath === '/dashboard/settings/profile',
        },
        {
          prependIcon: 'ReceiptMajor',
          title: 'Billing',
          onClick: () => {
            $router.push('/dashboard/settings/billing')
          },
          disabled: $route.fullPath === '/dashboard/settings/billing',
        },
        logout,
      ]
    })

    return {
      dropdownList,
      pseudoFocusOnMouseEnter,
    }
  },
})
</script>

<template>
  <Dropdown v-slot="dropdown" :option="dropdownList">
    <Tooltip
      v-slot="tooltip"
      label="Profile"
      :disabled="dropdown.active"
      open-delay="500"
    >
      <Button
        plain-action
        class="w-48 h-40 p-0 shrink-0"
        :class="{ 'bg-background-selected': dropdown.active }"
        v-on="{ ...dropdown.events, ...tooltip.events }"
        @click="dropdown.events.click"
        @blur="
          () => {
            dropdown.events.blur()
            tooltip.events.blur()
          }
        "
      >
        <Avatar
          :src="$user.avatar"
          :name="$user.name || ''"
          :initials="$user.initials"
          size="small"
        />
      </Button>
    </Tooltip>
  </Dropdown>
</template>

<style scoped lang="postcss">
.pseudo-focus[data-pseudo-focus] {
  @apply bg-background-default;
}
</style>
