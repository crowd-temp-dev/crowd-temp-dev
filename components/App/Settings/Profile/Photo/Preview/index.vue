<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import FLIPContainer from '~/components/Base/FLIPContainer/index.vue'
import Id from '~/components/Base/Id/index.vue'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'
import Img from '~/components/Base/Img/index.vue'

export default defineComponent({
  name: 'AppSettingsProfilePhotoPreview',
  components: { FLIPContainer, Id, FadeTransition, Img },
  setup() {
    const size = 500

    const halfSize = size / 2

    const viewPort = {
      width: size,
      height: size,
      x: innerWidth / 2 - halfSize,
      y: innerHeight / 2 - halfSize - 40,
    }

    return {
      viewPort,
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
    >
      <template #trigger="{ open, active }">
        <button
          type="button"
          class="outline-none focus-visible:ring-2 ring-action-primary-default ring-offset-2 rounded-full inline-block transition-[opacity,transform] active:scale-[0.99] transform-gpu group relative isolate mr-10"
          :class="{ 'opacity-0 pointer-events-none': active }"
          @click="open"
        >
          <PAvatar
            :id="`${id}-trigger`"
            :initials="$user.initials"
            size="large"
            :name="$user.name"
            source="/png/app/Home/onboard/poster.png"
            aria-label="Profile avatar"
            class="text-decorative-text-one bg-decorative-surface-one shrink-0 uppercase cursor-pointer !visible"
          />

          <span
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
          class="w-full h-full overflow-hidden transition-all rounded-full"
          :class="{ 'rounded-full': !active }"
        >
          <Img
            alt="Avatar"
            src="static/png/app/Home/onboard/poster"
            class="w-full h-full"
          />
        </div>
      </template>

      <template #append="{ overlayEntered, close, active }">
        <div
          v-if="active"
          class="w-full h-full fixed pointer-events-none inset-0 flex items-end"
        >
          <div class="w-full h-80 flex-centered z-2 relative">
            <div
              class="transition-[opacity,transform]"
              :class="{
                'opacity-0 translate-y-[100%]': !overlayEntered,
              }"
            >
              <div
                class="rounded-lg h-50 bg-[rgb(50,50,50,0.9)] border border-[rgb(75,75,75,0.7)] items-center flex space-x-4 pointer-events-auto"
                @click.stop
              >
                <Tooltip
                  v-slot="{ events }"
                  invert
                  label="Remove"
                  class="h-full"
                >
                  <button
                    class="flex-centered overlay-btn rounded-l-lg"
                    v-on="events"
                    @click="
                      () => {
                        close()
                      }
                    "
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
                  label="Update"
                  class="h-full"
                >
                  <label
                    for="MISSING_FILE_INPUT"
                    tabindex="0"
                    role="button"
                    class="flex-centered overlay-btn cursor-pointer"
                    v-on="events"
                    @keydown.space="$event.currentTarget.click()"
                  >
                    <PIcon source="ReplaceMajor" class="fill-white" />
                  </label>
                </Tooltip>

                <Tooltip
                  v-slot="{ events }"
                  invert
                  label="Close"
                  class="h-full"
                >
                  <button
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
