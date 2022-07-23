<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import CommentSection from '@/components/App/CommentSection/index.vue'
import UiDialog from '~/components/Base/UiDialog/index.vue'
import modelSync from '~/mixins/modelSync'

export default defineComponent({
  name: 'AppProjectHeaderCommentDialog',
  components: {
    UiDialog,
    CommentSection,
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
    <CommentSection divide-footer />
  </UiDialog>
</template>
