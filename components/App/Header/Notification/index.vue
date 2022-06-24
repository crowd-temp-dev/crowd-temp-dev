<script lang="ts">
import { defineComponent, computed, ref } from '@vue/composition-api'
import Button from '~/components/Base/Button/index.vue'
import { pseudoFocusOnMouseEnter } from '~/utils'
import Notification from '~/components/Base/Notification/index.vue'
import ComboBox from '~/components/Base/ComboBox/index.vue'
import Tooltip from '~/components/Base/Tooltip/index.vue'
import { UserNotification } from '~/server-middleware/types'

export default defineComponent({
  name: 'AppHeaderNotification',
  components: { Button, ComboBox, Notification, Tooltip },
  setup() {
    const list = computed(() => {
      return [
        {
          type: "What's new",
          title: 'Try out our latest feature',
          description:
            'Congrats your [test name] test has been publish and you can now start receiving responses',
          action: [
            {
              title: 'See it in action',
              attrs: {
                plain: true,
                autofocus: true,
              },
              on: {},
            },
          ],
        },

        {
          type: 'Updates',
          title: 'Your test is live!',
          description:
            'Congrats your [test name] test has been publish and you can now start receiving responses',
        },

        {
          type: 'Updates',
          title: 'Your test is live!',
          description:
            'Congrats your [test name] test has been publish and you can now start receiving responses',
        },
        {
          type: 'Updates',
          title: 'Your test is live!',
          description:
            'Congrats your [test name] test has been publish and you can now start receiving responses',
        },
        {
          type: 'Updates',
          title: 'Your test is live!',
          description:
            'Congrats your [test name] test has been publish and you can now start receiving responses',
        },
        {
          type: 'Updates',
          title: 'Your test is live!',
          description:
            'Congrats your [test name] test has been publish and you can now start receiving responses',
        },
        {
          type: 'Updates',
          title: 'Your test is live!',
          description:
            'Congrats your [test name] test has been publish and you can now start receiving responses',
        },

        {
          type: 'Action required',
          title: 'Update your billing details',
          description:
            'We were unable to process your subscription due to a billing error. Ensure your payment details are correct.',
          action: [
            {
              title: 'Go to billing',
            },
            {
              title: 'Learn more',
              attrs: {
                plain: true,
              },
            },
          ],
        },
      ] as UserNotification[]
    })

    const unread = ref(true)

    return {
      list,
      pseudoFocusOnMouseEnter,
      unread,
    }
  },
})
</script>

<template>
  <ComboBox
    :offset="[28, 12]"
    placement="bottom-end"
    block-click
    trap-tab-focus
    restore-focus
    :disabled="$route.path === '/notification'"
  >
    <template #trigger="{ active, toggle }">
      <Tooltip v-slot="{ events }" label="Notifications">
        <Button
          slot="activator"
          plain-action
          class="w-48 h-40 p-0 shrink-0"
          :class="{ 'bg-background-selected': active }"
          :disabled="$route.path === '/notification'"
          @click="
            () => {
              toggle()

              unread = false
            }
          "
          v-on="events"
        >
          <div
            class="relative fill-after after:bg-focused-default after:!w-8 after:!h-8 after:!rounded-full after:border after:border-white after:!left-auto after:!right-0 after:transform-gpu after:transition-transform"
            :class="{ 'after:scale-0': active }"
          >
            <PIcon source="NotificationMajor" :width="15.38" />
          </div>
        </Button>
      </Tooltip>
    </template>

    <template #default>
      <div
        class="rounded-lg shadow-5 overflow-y-auto max-h-[calc(100vh-72px)] max-w-[540px] isolate animate-[slide-y_0.35s_var(--ease-back-out)]"
        :style="{ '--slide-x-from': '10px' }"
      >
        <template v-if="list.length">
          <Notification
            v-for="(item, i) in list"
            :key="i"
            :type="item.type"
            :title="item.title"
            :time="120000"
            :description="item.description"
            :actions="item.action"
            :divide="i < list.length - 1"
            :read="[3, 5, 6].includes(i)"
          ></Notification>

          <div
            class="h-44 flex-centered not-supports-backdrop-filter:bg-surface-default supports-backdrop-filter:bg-surface-default/80 supports-backdrop-filter:backdrop-blur-[80px] sticky bottom-0 border-t border-background-default z-1"
          >
            <NuxtLink
              to="/notification"
              class="text-action-primary-default focus:underline outline-action-primary-default px-2 rounded-[6px]"
              @keydown.native.space="$router.push('/notification')"
            >
              See all
            </NuxtLink>
          </div>
        </template>

        <div
          v-else
          class="min-w-[240px] p-20 bg-surface-default text-text-subdued flex items-center"
        >
          <PIcon source="AlertMinor" class="fill-icon-subdued shrink-0 mr-8" />
          <strong class="flex-grow"> No notification </strong>
        </div>
      </div>
    </template>
  </ComboBox>
</template>

<style scoped lang="postcss">
.pseudo-focus[data-pseudo-focus] {
  @apply bg-background-default;
}
</style>
