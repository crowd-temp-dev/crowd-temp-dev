<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import { formatTime } from '~/utils'
import Button from '~/components/Base/Button/index.vue'
import { UserNotification, UserNotificationAction } from '~/server-middleware/types'

export default defineComponent({
  name: 'BaseNotification',
  components: { Button },
  props: {
    type: {
      type: String as () => UserNotification['type'],
      required: true,
    },
    time: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    actions: {
      type: Array as () => UserNotificationAction[],
      default: undefined,
    },
    read: Boolean,
    divide: Boolean,
  },

  setup(_props) {
    const props = computed(() => _props)

    const badgeClass = computed(() => {
      switch (props.value.type) {
        case 'Updates':
          return 'bg-surface-highlight-default'
        case "What's new":
          return 'bg-surface-success-default'
        case 'Action required':
          return 'bg-surface-critical-default'
        default:
          return ''
      }
    })

    const getTime = computed(() => formatTime(_props.time))

    return { badgeClass, getTime }
  },
})
</script>

<template>
  <div
    class="relative"
    :class="{ 'border-b border-background-default': divide }"
  >
    <div
      class="w-4 h-full rounded-l-lg shrink-0 absolute left-0 top-0"
      :class="{
        'bg-action-primary-disabled': read,
        'bg-action-primary-default': !read,
      }"
    />

    <div class="p-20 ml-4 bg-surface-default">
      <div class="flex items-center justify-between mb-4">
        <span
          class="rounded-[10px] h-24 flex-centered px-8"
          :class="badgeClass"
        >
          {{ type }}
        </span>

        <em class="not-italic text-text-subdued"> {{ getTime }} </em>
      </div>

      <h3 class="font-semibold mb-4">
        {{ title }}
      </h3>

      <p>
        {{ description }}
      </p>

      <div
        v-if="actions && actions.length"
        class="flex space-x-8 items-center mt-10"
      >
        <Button
          v-for="(action, i) in actions"
          :key="i"
          v-bind="action.attrs"
          v-on="action.on"
        >
          {{ action.title }}
        </Button>
      </div>
    </div>
  </div>
</template>
