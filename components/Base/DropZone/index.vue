<script lang="ts">
import { defineComponent, computed, ref } from '@vue/composition-api'
import Tooltip from '../Tooltip/index.vue'
import FLIPContainer from '../FLIPContainer/index.vue'
import FadeTransition from '../FadeTransition/index.vue'
import { convertToByte, formatByte, sleep, uid } from '~/utils'

export default defineComponent({
  name: 'DropZone',
  components: { Tooltip, FadeTransition, FLIPContainer },

  inheritAttrs: false,

  model: {
    event: 'update:modelValue',
    prop: 'modelValue',
  },
  props: {
    modelValue: {
      type: Array as () => File[],
      default: undefined,
    },
    multiple: Boolean,
    required: Boolean,
    maxSize: {
      type: String as () => `${number}${'kb' | 'mb' | 'gb'}`,
      default: '150mb',
    },
    minSize: {
      type: String as () => `${number}${'kb' | 'mb' | 'gb'}`,
      default: '1kb',
    },
    accept: {
      type: String,
      default: '*',
    },
    actionTitle: {
      type: String,
      default: 'Add file',
    },
    actionHint: {
      type: String,
      default: 'or drop files to upload',
    },
  },
  setup(_props, { emit, attrs, root }) {
    const input = ref<HTMLInputElement | null>(null)

    const rootId = ref(uid())

    const dragEnter = ref(false)
    const manualModel = ref<File[]>([])

    const modelSync = computed({
      get() {
        if (typeof _props.modelValue !== 'undefined') {
          return _props.modelValue
        }
        return manualModel.value
      },
      set(val: File[]) {
        if (typeof _props.modelValue !== 'undefined') {
          emit('update:modelValue', val)
        }
        manualModel.value = val
      },
    })

    const getFiles = computed(() => {
      return modelSync.value.map((file) => ({
        file,
        src: URL.createObjectURL(file),
        alt: file.name,
        size: formatByte(file.size),
      }))
    })

    const onChange = (evt: InputEvent) => {
      const input = evt.target as HTMLInputElement
      const inputFiles = input.files
      const files: File[] = []

      if (inputFiles) {
        const minSize = convertToByte(_props.minSize)
        const maxSize = convertToByte(_props.maxSize)
        for (const file of Array.from(inputFiles)) {
          if (file.size >= minSize && file.size <= maxSize) {
            files.push(file)
          } else {
            root.$pToast.open({
              error: true,
              message: `File size must be between ${_props.minSize} and ${_props.maxSize}`,
              duration: 4000,
            })
          }
        }
      }

      if (files.length) {
        modelSync.value = _props.multiple
          ? [...modelSync.value, ...files]
          : files
      }

      input.value = ''
    }

    const removeFile = (index: number) => {
      modelSync.value = modelSync.value.filter((_, i) => i !== index)
    }

    const openInput = () => {
      if (input.value instanceof HTMLInputElement) {
        input.value.click()
      }
    }

    const onDrop = () => {
      dragEnter.value = false
    }

    const inputAttrs = computed(() => ({
      attrs: {
        ref: 'input',
        type: 'file',
        autocomplete: 'off',
        multiple: _props.multiple ? 'multiple' : undefined,
        accept: _props.accept,
        ...attrs,
      },
      events: {
        change: onChange,
        drop: onChange,
      },
    }))

    return {
      modelSync,
      dragEnter,
      getFiles,
      inputAttrs,
      input,
      rootId,
      removeFile,
      openInput,
      onDrop,
      onChange,
      sleep,
    }
  },
})
</script>

<template>
  <Id v-slot="{ id }">
    <FLIPContainer tag="div" :trigger-view-port="`#${rootId}`">
      <template #trigger="{ open, ref, active }">
        <div
          :id="rootId"
          :ref="ref"
          class="min-h-[200px] p-[1.5rem] rounded-lg border-dashed border-2 relative isolate cursor-pointer transition-all active:scale-[0.9975] focus-within:ring-2 ring-offset-2 ring-action-primary-default group"
          :class="{
            'border-border-default hover:bg-surface-hovered': !dragEnter,
            'bg-surface-default': !getFiles.length,
            'bg-surface-hovered': getFiles.length,
            'border-interactive-default bg-surface-selected-default': dragEnter,
            'opacity-0': active,
          }"
          @dragenter="dragEnter = true"
          @dragover="dragEnter = true"
          @dragleave="dragEnter = false"
          @drop="onDrop"
        >
          <div
            class="p-[1.5rem] h-full items-center content-center justify-center justify-items-center grid gap-y-16"
          >
            <div
              class="pseudo cursor-pointer !pointer-events-auto"
              @click="openInput"
            >
              <label :for="id" class="sr-only">Select file(s)</label>
            </div>

            <template v-if="!dragEnter">
              <template v-if="!getFiles.length">
                <PIcon
                  source="UploadMajor"
                  class="w-40 h-40 fill-icon-default pointer-events-none"
                />

                <Button tabindex="-1" class="pointer-events-none">
                  {{ actionTitle }}
                </Button>

                <p class="text-text-subdued pointer-events-none text-center">
                  {{ actionHint }}
                </p>
              </template>

              <div
                v-else
                class="h-full absolute inset-0 max-h-full py-24 pointer-events-none"
              >
                <input
                  :id="id"
                  class="sr-only"
                  v-bind="inputAttrs.attrs"
                  v-on="inputAttrs.events"
                />

                <div
                  class="flex space-x-16 relative h-full px-16 hide-scrollbar overflow-x-auto pointer-events-auto cursor-pointer"
                  :class="{ 'justify-center': getFiles.length === 1 }"
                  @click="openInput"
                >
                  <Tooltip
                    v-for="(file, i) in getFiles"
                    :key="file.src"
                    class="w-[55%] h-full shrink-0"
                    @click.stop
                  >
                    <template #default="{ events }">
                      <div
                        class="w-full h-full bg-surface-default pointer-events-auto rounded border border-divider flex-centered relative group cursor-default overflow-hidden shadow-1"
                        v-on="events"
                        @click.stop
                      >
                        <div class="w-full h-full flex-centered">
                          <img
                            v-if="file.file.type.startsWith('image/')"
                            :src="file.src"
                            :alt="file.name"
                            class="w-full h-full object-contain"
                          />
                          <PIcon
                            v-else
                            source="NoteMajor"
                            class="w-72 h-72 fill-icon-default"
                          />
                        </div>

                        <div
                          class="pseudo bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 flex-centered"
                        >
                          <Tooltip v-slot="deleteTooltip" label="Remove" invert>
                            <div v-on="deleteTooltip.events">
                              <PIcon
                                source="DeleteMajor"
                                class="fill-white pointer-events-auto cursor-pointer"
                                @click.stop="removeFile(i)"
                              />
                            </div>
                          </Tooltip>
                        </div>
                      </div>
                    </template>

                    <template #content>
                      <div class="grid gap-y-8">
                        <p><strong>Name:</strong> {{ file.alt }}</p>

                        <p><strong>Type:</strong> {{ file.file.type }}</p>

                        <p><strong>Size:</strong> {{ file.size }}</p>
                      </div>
                    </template>
                  </Tooltip>
                </div>
              </div>
            </template>

            <p
              v-else
              class="text-heading-sm font-semibold text-interactive-default"
            >
              Drop files to upload
            </p>

            <input
              v-if="!getFiles.length ? true : dragEnter"
              :id="id"
              class="absolute inset-0 opacity-0 text-[transparent] appearance-none cursor-pointer"
              v-bind="inputAttrs.attrs"
              v-on="inputAttrs.events"
            />
          </div>

          <input
            type="text"
            class="sr-only"
            :required="required || undefined"
            :value="getFiles.length ? 'true' : ''"
          />

          <FadeTransition>
            <span
              v-if="getFiles.length"
              class="absolute right-4 top-4 inline-block transition-[opacity,transform] opacity-30 group-hover:opacity-70 hover:opacity-100 active:opacity-90 active:scale-[0.99] pointer-events-auto"
              @click.stop="open"
            >
              <PIcon
                source="MaximizeMinor"
                class="w-24 h-24 fill-icon-default"
              />
            </span>
          </FadeTransition>
        </div>
      </template>

      <template #prepend="{ active }">
        <FadeTransition>
          <div v-if="active" class="bg-black/90 fixed inset-0" />
        </FadeTransition>
      </template>

      <template #content="{ close, overlayEntered }">
        <div class="w-full h-full">
          <div class="w-full h-[calc(100%-80px)] flex-centered">
            <div
              class="max-w-[1200px] h-full w-full max-h-[650px] p-10 rounded overflow-hidden"
              @click.stop
            >
              <img
                v-if="getFiles[0]"
                :src="(getFiles[0] || {}).src"
                :alt="(getFiles[0] || {}).alt"
                class="w-full h-full block object-contain rounded"
              />
            </div>
          </div>

          <div class="w-full h-80 flex-centered z-2 relative">
            <div
              class="transition-[opacity,transform]"
              :class="{ 'opacity-0 translate-y-[100%]': !overlayEntered }"
            >
              <div
                class="rounded-lg h-50 bg-[rgb(68,68,68,0.7)] border border-[rgb(85,85,85,0.7)] items-center flex space-x-4"
                @click.stop
              >
                <span class="flex items-center h-full">
                  <Tooltip invert>
                    <template #default="{ events }">
                      <span
                        class="rounded-l-lg flex-centered w-50 h-50 transition-opacity opacity-40 hover:opacity-90"
                        v-on="events"
                      >
                        <PIcon
                          source="CircleInformationMajor"
                          class="fill-white"
                        />
                      </span>
                    </template>

                    <template #content>
                      <div class="grid gap-y-8">
                        <p>
                          <strong>Name:</strong> {{ (getFiles[0] || {}).alt }}
                        </p>

                        <p>
                          <strong>Type:</strong>
                          {{ (getFiles[0] || {}).file.type }}
                        </p>

                        <p>
                          <strong>Size:</strong> {{ (getFiles[0] || {}).size }}
                        </p>
                      </div>
                    </template>
                  </Tooltip>

                  <hr class="h-[90%] w-1 border-r border-[rgb(85,85,85,0.7)]" />
                </span>

                <Tooltip
                  v-slot="{ events }"
                  invert
                  label="Delete"
                  class="h-full"
                >
                  <button
                    class="flex-centered overlay-btn"
                    v-on="events"
                    @click="
                      () => {
                        close()

                        sleep(100).then(() => {
                          removeFile(0)
                        })
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
                  label="Replace"
                  class="h-full"
                >
                  <label
                    :for="id"
                    tabindex="0"
                    class="flex-centered overlay-btn cursor-pointer"
                    v-on="events"
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
  @apply transition-opacity opacity-70 hover:opacity-90 active:opacity-80 focus:opacity-100 h-full w-50 outline-none focus:ring-2 ring-offset-0 ring-action-primary-default;
}
</style>
