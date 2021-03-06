<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api'
import ListItem from '../../components/App/Trash/ListItem/index.vue'
import { Layout } from '~/types'
import { splitPath } from '~/utils'
import { dynamicPageTransition } from '~/utils/pageTransition'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'
import Intersection from '~/components/Base/Intersection/index.vue'
import Tooltip from '~/components/Base/Tooltip/index.vue'

export default defineComponent({
  name: 'AppTrashPage',
  components: { ListItem, FadeTransition, Intersection, Tooltip },
  layout: 'app' as Layout,
  transition: (to, from) =>
    dynamicPageTransition({
      to,
      from,
      useFade:
        !from ||
        splitPath(to.path).length === splitPath(from?.path || '').length,
    }),
  setup() {
    const selected = ref<string[]>([])

    const headerIntersecting = ref(true)

    const selectedActions: {
      title: string
      onClick: () => void
      primary?: boolean
      destructive?: boolean
    }[] = ['Recover', 'Delete'].map((title, index) => {
      return {
        title: `${title} selected`,
        onClick: () => {},
        primary: index === 0,
        destructive: index === 1,
      }
    })

    const trashItems = computed(() => {
      return Array.from(
        {
          length: 8,
        },
        (_, i) => `${i}`
      )
    })

    const allSelected = computed(() => {
      return trashItems.value.length === selected.value.length
    })

    const toggleSelectAll = () => {
      if (allSelected.value) {
        selected.value = []
      } else {
        selected.value = [...trashItems.value]
      }
    }

    const onItemCheck = (evt: { id: string; checked: boolean }) => {
      const { id, checked } = evt

      if (checked) {
        selected.value = Array.from(new Set([...selected.value, id]))
      } else {
        selected.value = selected.value.filter((x) => x !== id)
      }
    }

    const onHeaderIntersection = (evt: IntersectionObserverEntry) => {
      headerIntersecting.value = evt.isIntersecting
    }

    return {
      trashItems,
      selected,
      allSelected,
      selectedActions,
      headerIntersecting,
      toggleSelectAll,
      onItemCheck,
      onHeaderIntersection,
    }
  },

  head: {
    title: 'Trash',
    meta: [
      {
        name: 'description',
        content: 'View recently deleted tests',
        vmid: 'description',
        hid: 'description',
      },
    ],
  },
})
</script>

<template>
  <div class="w-full p-32 pb-96">
    <div class="max-w-app mx-auto isolate">
      <Intersection
        :config="{ rootMargin: '-62px 0px 0px 0px' }"
        root="main"
        :disabled="!selected.length"
        @update:entry="onHeaderIntersection"
      >
        <h2 class="text-heading leading-[20px] text-text-subdued">
          Trash items will be deleted after 30 days
        </h2>
      </Intersection>

      <FadeTransition>
        <div
          v-if="selected.length"
          class="sticky top-[calc(64px)] z-10 bg-surface-neutral-disabled -mb-10 py-10 fill-after after:border-b after:border-b-divider after:transition-opacity after:opacity-0 after:z-1"
          :class="{ 'after:!opacity-100': !headerIntersecting }"
        >
          <div class="flex items-center justify-between">
            <Tooltip
              v-slot="{ events }"
              :disabled="!allSelected"
              :label="`${selected.length} items`"
              placement="right"
              open-delay="100"
            >
              <Id v-slot="{ id }">
                <label
                  :for="id"
                  class="rounded-l bg-surface-default p-8 pr-16 block cursor-pointer"
                  v-on="events"
                >
                  <Checkbox
                    :id="id"
                    :key="allSelected"
                    :indeterminate="!allSelected"
                    :checked="allSelected"
                    class="cursor-pointer"
                    @on-change="toggleSelectAll"
                  >
                    <span
                      class="font-semibold text-interactive-default cursor-pointer"
                    >
                      {{ allSelected ? 'All' : selected.length }} selected
                    </span>
                  </Checkbox>
                </label>
              </Id>
            </Tooltip>

            <div class="flex space-x-8 items-center">
              <Button
                v-for="(action, i) in selectedActions"
                :key="i"
                :primary="action.primary"
                :destructive="action.destructive"
                @click="action.onClick"
              >
                {{ action.title }}
              </Button>
            </div>
          </div>
        </div>
      </FadeTransition>

      <TransitionGroup
        tag="ul"
        enter-class="opacity-0"
        move-class="transition-[transform,opacity]"
        enter-active-class="transition-[transform,opacity]"
        leave-active-class="transition-[transform,opacity]"
        leave-to-class="opacity-0"
        class="mt-10 grid gap-y-10"
      >
        <ListItem
          v-for="(item, i) in trashItems"
          :id="item"
          :key="i"
          :checked="selected.includes(item)"
          :select-mode="!!selected.length"
          @on-change="onItemCheck"
        />
      </TransitionGroup>
    </div>
  </div>
</template>
