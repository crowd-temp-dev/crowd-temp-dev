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
    const dropdownList = ref<DropdownList[]>(
      [
        {
          prependIcon: 'CategoriesMajor',
          title: 'Help desk',
          onClick: () => {
            $router.push('/dashboard/settings/profile')
          },
        },
        {
          prependIcon: 'DesktopMajor',
          title: 'Video Tutorials',
          onClick: () => {
            $router.push('/dashboard/settings/billing')
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
      ].map((x) => ({ ...x, disabled: true } as DropdownList))
    )

    return {
      dropdownList,
      pseudoFocusOnMouseEnter,
    }
  },
})
</script>

<template>
  <Dropdown :option="dropdownList">
    <template #default="dropdown">
      <Tooltip
        v-slot="tooltip"
        label="Help"
        :disabled="dropdown.active"
        open-delay="500"
      >
        <Button
          plain-action
          class="w-40 h-40 p-0 shrink-0"
          :class="{ 'bg-background-selected': dropdown.active }"
          v-on="{ ...tooltip.events, ...dropdown.events }"
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
    </template>

    <template #prepend>
      <hr class="border-t border-divider mb-4 -mt-4" />
      <p class="text-center pb-8">Features coming soon</p>
    </template>
  </Dropdown>
</template>

<style scoped lang="postcss">
.pseudo-focus[data-pseudo-focus] {
  @apply bg-background-default;
}
</style>
