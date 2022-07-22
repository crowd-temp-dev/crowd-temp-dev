<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import CommentField from './CommentField/index.vue'
import CommentMessage from './CommentMessage/index.vue'

export default defineComponent({
  name: 'AppCommentSection',
  components: {
    CommentField,
    CommentMessage,
  },
  props: {
    divideFooter: Boolean,
  },
  setup() {},
})
</script>

<template>
  <div class="grid grid-rows-[1fr,auto] h-full isolate">
    <div class="h-full px-20 pb-20">
      <div v-if="false" class="flex-centered h-full">
        <div class="grid justify-center">
          <PIcon
            source="ChatMajor"
            class="w-35 h-35 fill-interactive-disabled"
          />

          <p class="mt-6">No comments yet</p>
        </div>
      </div>

      <div v-else>
        <CommentMessage />
      </div>
    </div>

    <footer class="sticky bottom-0 z-1 bg-surface-default pb-20 px-20">
      <div>
        <hr v-if="divideFooter" class="w-full h-1 mb-20" />

        <CommentField />
      </div>
    </footer>
  </div>
</template>
