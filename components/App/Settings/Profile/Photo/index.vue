<script lang="ts">
import { defineComponent, nextTick, ref } from '@vue/composition-api'
import Preview from './Preview/index.vue'

export default defineComponent({
  name: 'AppSettingsProfilePhoto',
  components: { Preview },

  setup(_, { root: { $user } }) {
    const uploadedFile = ref<File[]>([])

    const fileUploaded = async () => {
      await nextTick()

      await $user.updateAvatar(uploadedFile.value)
    }

    return { uploadedFile, fileUploaded }
  },
})
</script>

<template>
  <Id v-slot="{ id }">
    <div>
      <aside
        class="rounded-[3px] p-20 bg-surface-default w-240 sticky top-96 xl:top-108"
      >
        <h3 class="text-heading font-semibold mb-20">Your photo</h3>

        <div class="flex items-center">
          <Preview />

          <div>
            <strong class="mb-4"> Edit your photo </strong>

            <div class="flex space-x-10 items-center justify-between">
              <Button
                plain
                class="text-interactive-critical hover:text-interactive-critical-hovered active:text-interactive-critical-depressed text-body pr-0"
                :disabled="!$user.avatar || $user.avatarLoading"
                @click="$user.removeAvatar"
              >
                Delete
              </Button>

              <label
                :for="id"
                role="button"
                :tabindex="$user.avatarLoading ? '-1' : '0'"
                class="!text-body text-action-primary-default hover:text-action-primary-hovered hover:underline focus:ring-2 ring-action-primary-default rounded cursor-pointer"
                :class="{
                  'opacity-40 grayscale pointer-events-none':
                    $user.avatarLoading,
                }"
              >
                {{ $user.avatar ? 'Update' : 'Upload' }}
              </label>
            </div>
          </div>
        </div>

        <div class="plain-upload">
          <DropZone
            :id="id"
            v-model="uploadedFile"
            :disabled="$user.avatarLoading"
            :action-attrs="{ plain: true }"
            hide-icon
            disable-preview
            type="image"
            outline
            class="mt-24"
            @on-change="fileUploaded"
          />
        </div>
      </aside>
    </div>
  </Id>
</template>
