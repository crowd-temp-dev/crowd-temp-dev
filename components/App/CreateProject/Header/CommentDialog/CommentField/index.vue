<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'

export default defineComponent({
  name: 'AppProjectHeaderCommentDialog',
  components: {},
  props: {
    autofocus: Boolean,
  },
  emits: ['on-comment'],
  setup() {
    const commentValue = ref('')

    return { commentValue }
  },
})
</script>

<template>
  <Id v-slot="{ id }">
    <label :for="id" class="block">
      <TextField
        :id="id"
        v-model="commentValue"
        multiline
        class="CommentField"
        placeholder="Write your comment here"
        :autofocus="autofocus"
      >
        <template #suffix>
          <div class="flex items-center justify-between px-8 py-10 w-full">
            <Avatar name="User name" initials="UN" size="small" />

            <Button
              primary
              :disabled="!commentValue.trim()"
              @click.stop="$emit('on-comment', commentValue)"
            >
              Comment
            </Button>
          </div>
        </template>
      </TextField>
    </label>
  </Id>
</template>

<style scoped>
.CommentField >>> .Polaris-TextField {
  flex-direction: column;
}

.CommentField >>> .Polaris-TextField textarea {
  max-height: 72px;
  min-height: 40px;
  resize: none;
}

.CommentField >>> .Polaris-TextField__Suffix {
  width: 100%;
  margin: 0;
}
</style>
