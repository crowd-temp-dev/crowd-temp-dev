<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import Notification from '~/components/Base/Notification/index.vue'
import { dynamicPageTransition } from '~/utils/pageTransition'
import { splitPath } from '~/utils'
import {
  UserNotificationAction,
  UserNotificationBadge,
} from '~/server-middleware/types'

export default defineComponent({
  name: 'NotificationPage',
  components: { Notification },
  layout: 'app',
  transition: (to, from) =>
    dynamicPageTransition({
      to,
      from,
      useFade:
        !from ||
        splitPath(to.path).length === splitPath(from?.path || '').length,
    }),

  setup() {
    return {
      list: [
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
      ] as {
        type: UserNotificationBadge
        title: string
        time?: number
        description: string
        action?: UserNotificationAction[]
      }[],
    }
  },

  head() {
    return {
      title: 'Notification',
    }
  },
})
</script>

<template>
  <div class="mt-32 mb-96 mx-auto px-32 w-full">
    <div class="max-w-app mx-auto">
      <div class="max-w-[734px] xxl:mx-auto flex flex-col">
        <Notification
          v-for="(item, i) in list"
          :key="i"
          :type="item.type"
          :title="item.title"
          :time="120000"
          :description="item.description"
          :actions="item.action"
          :divide="i < list.length - 1"
          read
          class="w-full grow"
          hide-status
        ></Notification>
      </div>
    </div>
  </div>
</template>
