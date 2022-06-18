<template>
  <div>
    <aside
      class="rounded-[3px] p-20 bg-surface-default w-240 sticky top-96 xl:top-108"
    >
      <h3 class="text-heading font-semibold mb-20">Your photo</h3>

      <div class="flex items-center">
        <PAvatar
          :initials="$user.initials"
          size="large"
          class="text-decorative-text-one bg-decorative-surface-one mr-10 shrink-0 uppercase"
        />

        <div>
          <strong class="mb-4"> Edit your photo </strong>

          <div class="flex space-x-10 items-center">
            <Button
              plain
              class="text-interactive-critical hover:text-interactive-critical-hovered active:text-interactive-critical-depressed text-body pr-0"
            >
              Delete
            </Button>

            <Button plain class="text-body"> Update </Button>
          </div>
        </div>
      </div>

      <div class="plain-upload">
        <PDropZone
          :label-action="{}"
          type="image"
          outline
          :files="[]"
          :handle-on-drop="() => {}"
          action-title="Add file"
          class="mt-24"
        />
      </div>
    </aside>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import Button from '~/components/Base/Button/index.vue'

export default defineComponent({
  name: 'AppSettingsProfilePhoto',
  components: { Button },

  setup() {},
})
</script>

<style lang="postcss" scoped></style>
