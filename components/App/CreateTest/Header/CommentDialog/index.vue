<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import CommentField from './CommentField/index.vue'
import CommentMessage from './CommentMessage/index.vue'
import UiDialog from '~/components/Base/UiDialog/index.vue'
import modelSync from '~/mixins/modelSync'

export default defineComponent({
  name: 'AppCreateTestHeaderCommentDialog',
  components: {
    UiDialog,
    CommentField,
    CommentMessage,
  },
  mixins: [
    modelSync({
      type: Boolean,
      default: false,
    }),
  ],
  setup() {},
})
</script>

<template>
  <UiDialog
    v-model="modelSync"
    v-bind="$attrs"
    from="right"
    as-drawer
    title="Preview comments"
    root-class="!p-0 !bg-black/0"
    content-class="!rounded-none w-380"
    body-class="!pb-0 !px-0"
  >
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
          <hr class="w-full h-1 mb-20" />

          <CommentField />
        </div>
      </footer>
    </div>
  </UiDialog>
</template>
