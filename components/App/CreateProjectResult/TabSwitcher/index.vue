<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api'
import { splitPath } from '~/utils'
import Radio from '~/components/Base/Radio/index.vue'
import { viewResultTabSwitcher } from '~/utils/elementIds'

type TabPath = 'user-sessions' | 'responses' | 'analytics' | 'comments'

interface Tab {
  title: 'Responses' | 'User sessions' | 'Analytics' | 'Comments'
  active: boolean
  disabled?: boolean
  name: TabPath
}

export default defineComponent({
  name: 'AppProjectViewResultTabSwitcher',
  components: { Radio },

  setup(_, { root }) {
    const tabs = computed<Tab[]>(() => {
      const paths = splitPath(root.$route.path)

      const tab = paths[3] as TabPath

      return [
        {
          title: 'Responses',
          active: tab === 'responses',
          name: 'responses',
        },
        {
          title: 'User sessions',
          active: tab === 'user-sessions',
          name: 'user-sessions',
        },
        {
          title: 'Analytics',
          active: tab === 'analytics',
          name: 'analytics',
          disabled: true,
        },
        {
          title: 'Comments',
          active: tab === 'comments',
          name: 'comments',
        },
      ]
    })

    const changeTab = (tab: TabPath) => {
      const testId = root.$route.params.id

      root.$router.push(`/dashboard/project/view-result/${tab}/${testId}/`)
    }

    return { tabs, changeTab, viewResultTabSwitcher }
  },

  fetch() {},
})
</script>

<template>
  <div
    :id="viewResultTabSwitcher"
    class="sticky top-63 bg-surface-neutral-disabled z-1 w-[calc(100%+8px)] ml-[-4px] px-2"
  >
    <Id v-slot="{ id }">
      <RadioGroup
        :id="id"
        class="w-full shadow-divide-bottom"
        content-class="flex space-x-28 px-0 -ml-2"
        disable-vertical-tabing
        no-loop
        @on-change="changeTab"
      >
        <Radio
          v-for="(tab, i) in tabs"
          :key="i"
          :checked="tab.active"
          name="viewResultTabSwitcher"
          :value="tab.name"
          icon-class="sr-only"
          class="h-52 fill-before before:!top-auto before:!bottom-0 before:!rounded-t before:!left-4 before:!w-[calc(100%-8px)] before:!h-3 before:bg-action-primary-default before:transition-[opacity,transform] relative overflow-hidden active:opacity-80 transition-opacity group"
          :class="{
            'before:translate-y-[100%] before:opacity-0': !tab.active,
            'before:delay-150': tab.active,
            'opacity-40 pointer-events-none': tab.disabled,
            'cursor-default': tab.active,
          }"
          :disabled="tab.disabled"
        >
          <template #label>
            <strong
              class="relative block fill-before before:transition-opacity before:opacity-0 rounded before:bg-black/5 px-4 before:-z-1 group-focus-within:before:!opacity-100 group-hover:before:opacity-50"
              :class="{
                'text-text-subdued': !tab.active,
              }"
            >
              {{ tab.title }}
            </strong>
          </template>
        </Radio>
      </RadioGroup>
    </Id>
  </div>
</template>
