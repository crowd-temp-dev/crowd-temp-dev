<script lang="ts">
import { defineComponent, ref, onMounted } from '@vue/composition-api'
import { scrollMain, sleep } from '~/utils'

export default defineComponent({
  name: 'AppCreateTestHeaderCommentDialog',
  components: {},
  props: {
    autofocus: Boolean,
    scrollIntoView: Boolean,
  },
  emits: ['on-comment', 'on-mounted'],
  setup(_props, { emit }) {
    const root = ref<HTMLElement>()

    const commentValue = ref('')

    onMounted(async () => {
      await sleep()

      emit('on-mounted')

      if (_props.scrollIntoView && root.value) {
        const { bottom, top } = root.value.getBoundingClientRect()

        if (bottom > innerHeight - 116) {
          scrollMain(top)
        }
      }
    })

    return { commentValue, root }
  },
})
</script>

<template>
  <Id v-slot="{ id }">
    <label ref="root" :for="id" class="block">
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
