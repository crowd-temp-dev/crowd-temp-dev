<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import CommentField from '../CommentField/index.vue'
import Avatar from '~/components/Base/Avatar/index.vue'
import { uid } from '~/utils'
import eventKey from '~/utils/eventKey'

export default defineComponent({
  name: 'AppProjectHeaderCommentDialog',
  components: {
    CommentField,
    Avatar,
  },
  setup() {
    const replying = ref<string>()

    const messages = ref<
      {
        id: string
        content: string
        user: { id: string; initials: string; name: string }
      }[]
    >([
      {
        id: '20',
        content: 'This is my first comment on a preview link',
        user: {
          id: '1',
          initials: 'UJ',
          name: 'Ujo',
        },
      },
    ])

    const onReply = (id: string) => {
      replying.value = id
    }

    const onComment = (index: number, content: string) => {
      messages.value[index + 1] = {
        id: uid(),
        content,
        user: {
          id: '2',
          initials: 'JS',
          name: 'SJK',
        },
      }

      replying.value = null
    }

    const hideReplyOnEsc = (evt: KeyboardEvent) => {
      if (!replying.value) {
        return
      }

      if (eventKey(evt) === 'esc') {
        evt.stopPropagation()

        replying.value = null
      }
    }

    return { messages, replying, onReply, onComment, hideReplyOnEsc }
  },
})
</script>

<template>
  <TransitionGroup
    tag="ol"
    enter-class="opacity-0 -translate-y-10 will-change-[transform,opacity]"
    move-class="transition-[transform,opacity]"
    enter-active-class="will-change-[transform,opacity] transition-[transform,opacity] transfrom-gpu"
    leave-active-class="will-change-[transform,opacity] transition-[transform,opacity] transfrom-gpu"
    leave-to-class="opacity-0 -translate-x-10 will-change-[transform,opacity]"
    class="isolate"
    @keydown="hideReplyOnEsc"
  >
    <li
      v-for="(message, i) in messages"
      :key="i"
      class="flex items-start space-x-10 before:h-full before:w-1 before:bg-[#979797] before:absolute before:top-0 relative before:left-16 before:none"
      :class="{
        '!before:block': messages.length > 1 || replying,
        'before:invisible':
          i === messages.length - 1 && replying !== message.id,
      }"
    >
      <Avatar
        :name="message.user.name"
        :initials="message.user.initials"
        size="small"
        class="shrink-0 z-1 relative"
      />

      <div class="mt-4 w-full">
        <p
          :class="[
            replying !== message.id && i === messages.length - 1
              ? 'mb-12'
              : 'mb-32',
          ]"
        >
          {{ message.content }}
        </p>

        <Button
          v-if="replying !== message.id && i === messages.length - 1"
          plain
          @click="onReply(message.id)"
        >
          Reply
        </Button>

        <CommentField
          v-else-if="replying === message.id"
          class="mt-40 -ml-42 w-[calc(100%+32px)]"
          autofocus
          @on-comment="(evt) => onComment(i, evt)"
        />
      </div>
    </li>
  </TransitionGroup>
</template>
