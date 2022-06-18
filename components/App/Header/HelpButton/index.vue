<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import Button from '~/components/Base/Button/index.vue'
import { pseudoFocusOnMouseEnter } from '~/utils'
import Dropdown from '~/components/Base/Dropdown/index.vue'
import Tooltip from '~/components/Base/Tooltip/index.vue'

interface DropdownList {
  prependIcon:
    | 'CategoriesMajor'
    | 'DesktopMajor'
    | 'ReadTimeMinor'
    | 'BugMajor'
    | 'EmailNewsletterMajor'
  title:
    | 'Help desk'
    | 'Video Tutorials'
    | 'Learning resources'
    | 'Report a bug'
    | 'Contact us'
  onClick: () => void
}

export default defineComponent({
  name: 'AppHeaderHelperButton',
  components: { Button, Dropdown, Tooltip },
  setup(_, { root: { $router } }) {
    const dropdownList = ref<DropdownList[]>([
      {
        prependIcon: 'CategoriesMajor',
        title: 'Help desk',
        onClick: () => {
          $router.push('/settings/profile')
        },
      },
      {
        prependIcon: 'DesktopMajor',
        title: 'Video Tutorials',
        onClick: () => {
          $router.push('/settings/billing')
        },
      },
      {
        title: 'Learning resources',
        prependIcon: 'ReadTimeMinor',
        onClick: () => {},
      },
      {
        title: 'Report a bug',
        prependIcon: 'BugMajor',
        onClick: () => {},
      },
      {
        title: 'Contact us',
        prependIcon: 'EmailNewsletterMajor',
        onClick: () => {},
      },
    ])

    return {
      dropdownList,
      pseudoFocusOnMouseEnter,
    }
  },
})
</script>

<template>
  <Dropdown v-slot="dropdown" :option="dropdownList">
    <Tooltip v-slot="tooltip" label="Help" :disabled="dropdown.active">
      <Button
        plain-action
        class="w-40 h-40 p-0 shrink-0"
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
        <PIcon source="QuestionMarkMajor" />
      </Button>
    </Tooltip>
  </Dropdown>
</template>

<style scoped lang="postcss">
.pseudo-focus[data-pseudo-focus] {
  @apply bg-background-default;
}
</style>
