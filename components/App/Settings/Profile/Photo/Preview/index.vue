<script lang="ts">
import { defineComponent, nextTick, ref } from '@vue/composition-api'
import FLIPContainer from '~/components/Base/FLIPContainer/index.vue'
import Id from '~/components/Base/Id/index.vue'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'
import Spinner from '~/components/Base/Spinner/index.vue'
import { sleep } from '~/utils'
import DropZone from '~/components/Base/DropZone/index.vue'

export default defineComponent({
  name: 'AppSettingsProfilePhotoPreview',
  components: { FLIPContainer, Id, FadeTransition, Spinner, DropZone },
  setup(_, { root: { $user } }) {
    const uploadedFile = ref<File[]>([])

    const size = 500

    const halfSize = size / 2

    const viewPort = {
      width: size,
      height: size,
      x: innerWidth / 2 - halfSize,
      y: innerHeight / 2 - halfSize - 40,
    }

    const removeAvatar = async (close: () => void) => {
      const { data } = await $user.removeAvatar()

      if (data) {
        await sleep(100)

        close()
      }
    }

    const fileUploaded = async () => {
      await nextTick()

      await $user.updateAvatar(uploadedFile.value)
    }

    return {
      uploadedFile,
      viewPort,
      removeAvatar,
      fileUploaded,
    }
  },
})
</script>

<template>
  <Id v-slot="{ id }">
    <FLIPContainer
      :trigger-view-port="`#${id}-trigger`"
      :view-port="viewPort"
      ignore-border-radius
      :enter-transition="{
        duration: '350',
        ease: 'cubic-bezier(0.175, 0.885, 0.32, 1.05)',
      }"
    >
      <template #trigger="{ open, active }">
        <button
          type="button"
          class="outline-none focus-visible:ring-2 ring-action-primary-default ring-offset-2 rounded-full inline-block transition-[opacity,transform] active:scale-[0.99] transform-gpu group relative isolate mr-10"
          :class="{ 'opacity-0 pointer-events-none': active }"
          :disabled="$user.avatarLoading"
          @click="open"
        >
          <Avatar
            :id="`${id}-trigger`"
            :initials="$user.initials"
            size="large"
            :name="$user.name"
            :src="$user.avatar"
            aria-label="Profile avatar"
            class="text-decorative-text-one bg-decorative-surface-one shrink-0 uppercase cursor-pointer !visible"
          />

          <div
            v-if="$user.avatarLoading"
            class="fade-appear h-full w-full rounded-[inherit] absolute inset-0 z-1 flex-centered text-white supports-backdrop-filter:backdrop-blur-lg supports-backdrop-filter:bg-black/60 not-supports-backdrop-filter:bg-black/90 supports-backdrop-filter:border border-divider/20"
          >
            <Spinner />
          </div>

          <span
            v-else
            class="bg-black/60 w-full h-full rounded-full flex-centered absolute z-1 inset-0 opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-90"
          >
            <PIcon source="MaximizeMinor" class="fill-white" />
          </span>
        </button>
      </template>

      <template #prepend="{ active }">
        <FadeTransition>
          <div v-if="active" class="bg-black/95 fixed inset-0" />
        </FadeTransition>
      </template>

      <template #content="{ active }">
        <div
          class="w-full h-full overflow-hidden transition-all rounded-full relative"
          :class="{ 'rounded-full': !active }"
        >
          <Avatar
            :name="$user.name"
            :initials="$user.initials"
            :src="$user.avatar"
            class="w-full h-full text-[96px]"
            :class="{ 'blur-md': $user.avatarLoading }"
            size="auto"
          />

          <div
            v-if="$user.avatarLoading"
            class="fade-appear h-full w-full rounded-[inherit] absolute inset-0 z-1 flex-centered text-display-x-large text-white supports-backdrop-filter:backdrop-blur-lg supports-backdrop-filter:bg-black/60 not-supports-backdrop-filter:bg-black/90 supports-backdrop-filter:border border-divider/20"
          >
            <Spinner />
          </div>
        </div>
      </template>

      <template #append="{ overlayEntered, close, active }">
        <div
          v-if="active"
          class="w-full h-full fixed pointer-events-none inset-0 flex items-end z-10"
        >
          <div class="w-full h-80 flex-centered z-2 relative">
            <div
              class="transition-[opacity,transform] duration-300"
              :class="{
                'opacity-0 translate-y-[100%]': !overlayEntered,
              }"
              :style="{
                'transition-timing-function': ` cubic-bezier(
                  0.175,
                  0.885,
                  0.32,
                  1.1
                )`,
              }"
            >
              <div
                class="rounded-lg h-50 bg-[rgb(50,50,50,0.9)] border border-[rgb(75,75,75,0.7)] items-center flex space-x-4 pointer-events-auto"
                @click.stop
              >
                <Tooltip
                  v-if="$user.avatar"
                  v-slot="{ events }"
                  invert
                  label="Remove"
                  class="h-full"
                >
                  <button
                    aria-label="Remove photo"
                    class="flex-centered overlay-btn rounded-l-lg"
                    :class="{ '!opacity-40': $user.avatarLoading }"
                    :disabled="$user.avatarLoading ? 'disabled' : undefined"
                    v-on="events"
                    @click="removeAvatar(close)"
                  >
                    <PIcon
                      source="DeleteMajor"
                      class="fill-border-critical-subdued"
                    />
                  </button>
                </Tooltip>

                <Tooltip
                  v-slot="{ events }"
                  invert
                  :label="$user.avatar ? 'Update' : 'Upload'"
                  class="h-full"
                >
                  <label
                    :for="`${id}-file`"
                    aria-label="Replace photo"
                    :tabindex="$user.avatarLoading ? '-1' : '0'"
                    role="button"
                    class="flex-centered overlay-btn cursor-pointer"
                    :class="{
                      'rounded-l-lg': !$user.avatar,
                      '!opacity-40 pointer-events-none': $user.avatarLoading,
                    }"
                    v-on="events"
                    @keydown.space="$event.currentTarget.click()"
                  >
                    <DropZone
                      :id="`${id}-file`"
                      v-model="uploadedFile"
                      plain
                      class="sr-only"
                      @on-change="fileUploaded"
                    />
                    <PIcon
                      :source="$user.avatar ? 'ReplaceMajor' : 'UploadMajor'"
                      class="fill-white"
                    />
                  </label>
                </Tooltip>

                <Tooltip
                  v-slot="{ events }"
                  invert
                  label="Close"
                  class="h-full"
                >
                  <button
                    aria-label="Close preview"
                    class="rounded-r-lg flex-centered overlay-btn"
                    v-on="events"
                    @click="close"
                  >
                    <PIcon source="CircleCancelMajor" class="fill-white" />
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </template>
    </FLIPContainer>
  </Id>
</template>

<style scoped lang="postcss">
.overlay-btn {
  @apply transition-opacity opacity-70 hover:opacity-90 active:opacity-80 focus:opacity-100 h-full w-50 outline-none focus-visible:ring-2 ring-offset-0 ring-action-primary-default;
}
</style>
