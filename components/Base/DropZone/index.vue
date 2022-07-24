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
    id: {
      type: String,
      default: undefined,
    },
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
    actionAttrs: {
      type: Object,
      default: () => ({}),
    },
    disablePreview: Boolean,
    plain: Boolean,
    hideIcon: Boolean,
    outline: Boolean,
    disabled: Boolean,
  },
  emits: ['on-change'],
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
      return modelSync.value.map((file) => {
        if (typeof file === 'string') {
          return {
            src: `uploads/${file}`,
            file: {
              type: 'image/',
            },
          }
        }

        return {
          file,
          src: URL.createObjectURL(file),
          alt: file.name,
          size: formatByte(file.size),
        }
      })
    })

    const onChange = (evt: InputEvent) => {
      const input = evt.target as HTMLInputElement
      const inputFiles = input.files
      const files: File[] = []

      if (inputFiles) {
        const minSize = convertToByte(_props.minSize)
        const maxSize = convertToByte(_props.maxSize)
        for (const file of Array.from(inputFiles)) {
          if (
            !new RegExp(
              _props.accept.replace(/\*/g, '[a-z]+').replace(/,/g, '|')
            ).test(file.type)
          ) {
            root.$pToast.open({
              error: true,
              message: `Accepts only ${_props.accept
                .replace(/,/g, ' or ')
                .replace(/\/\*/g, '')
                .trim()}`,
              duration: 4000,
            })
          } else if (file.size >= minSize && file.size <= maxSize) {
            files.push(file)
          } else {
            const small = file.size < minSize

            root.$pToast.open({
              error: true,
              message: `File too ${small ? 'small' : 'large'}`,
              duration: 4000,
            })

            sleep(1000).then(() => {
              root.$pToast.open({
                error: true,
                message: `File size must be between ${_props.minSize} and ${_props.maxSize}`,
                duration: 4000,
              })
            })
          }
        }
      }

      if (files.length) {
        modelSync.value = _props.multiple
          ? [...modelSync.value, ...files]
          : files

        emit('on-change', modelSync.value)
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
        ...attrs,
        ref: 'input',
        type: 'file',
        autocomplete: 'off',
        multiple: _props.multiple ? 'multiple' : undefined,
        accept: _props.accept,
        disabled: _props.disabled,
      },
      events: {
        change: onChange,
        drop: onChange,
      },
    }))

    const width = Math.min(innerWidth, 800)

    const height = Math.min(innerHeight, 650)

    const viewPort = {
      width,
      height,
      x: innerWidth / 2 - width / 2,
      y: innerHeight / 2 - height / 2 - 40,
    }

    const showRootInput = computed(() => {
      if (_props.plain) {
        return true
      }
      return !getFiles.value.length ? true : dragEnter
    })

    const inputClickable = computed(() => {
      return !!getFiles.value.length && !dragEnter.value
    })

    return {
      modelSync,
      dragEnter,
      getFiles,
      inputAttrs,
      input,
      rootId,
      viewPort,
      showRootInput,
      inputClickable,
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
  <Id v-slot="idProps">
    <FLIPContainer
      tag="div"
      :trigger-view-port="`#${rootId}-preview`"
      :view-port="viewPort"
      :disabled="disablePreview || plain"
      :enter-transition="{
        duration: '350',
        ease: 'cubic-bezier(0.175, 0.885, 0.32, 1.05)',
      }"
    >
      <template #trigger="{ open, active }">
        <div
          :id="rootId"
          class="rounded-lg border-dashed border-2 relative isolate cursor-pointer transition-all active:scale-[0.9975] focus-within:ring-2 ring-offset-2 ring-action-primary-default group"
          :class="{
            'hover:bg-surface-hovered': !dragEnter,
            'border-border-default': !disabled,
            'bg-surface-default': !getFiles.length,
            'bg-surface-hovered': getFiles.length,
            'border-interactive-default bg-surface-selected-default': dragEnter,
            'min-h-[200px] p-[1.5rem]': !outline,
            'min-h-[110px] pt-[1rem]': outline,
            'pointer-events-none grayscale opacity-50 border-border-default/50':
              disabled,
          }"
          @dragenter="dragEnter = true"
          @dragover="dragEnter = true"
          @dragleave="dragEnter = false"
          @drop="onDrop"
          @click="dragEnter = false"
        >
          <div
            class="p-[1.5rem] h-full items-center content-center justify-center justify-items-center grid"
            :class="{ 'gap-y-16': !outline, 'gap-y-4': outline }"
          >
            <div
              v-if="!plain"
              class="pseudo"
              :class="{ 'cursor-copy !pointer-events-auto': !disabled }"
              @click="openInput"
            >
              <label :for="id || idProps.id" class="sr-only"
                >Select file(s)
              </label>
            </div>

            <template v-if="!dragEnter && !plain">
              <template v-if="!getFiles.length || outline">
                <PIcon
                  v-if="!hideIcon"
                  source="UploadMajor"
                  class="w-40 h-40 fill-icon-default pointer-events-none"
                />

                <Button
                  v-if="actionTitle"
                  tabindex="-1"
                  class="pointer-events-none"
                  v-bind="actionAttrs"
                >
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
                  :id="id || idProps.id"
                  class="sr-only"
                  v-bind="inputAttrs.attrs"
                  v-on="inputAttrs.events"
                />

                <div
                  class="flex space-x-16 relative h-full px-16 hide-scrollbar overflow-x-auto"
                  :class="{
                    'justify-center': getFiles.length === 1,
                    'pointer-events-auto cursor-copy': !disabled,
                  }"
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
                        class="w-full h-full bg-surface-default pointer-events-auto rounded border border-divider flex-centered relative group cursor-default overflow-hidden shadow-1 transition-opacity"
                        :class="{
                          'opacity-0': active,
                        }"
                        v-on="events"
                        @click.stop
                      >
                        <div
                          :id="`${rootId}-preview`"
                          class="w-full h-full flex-centered"
                        >
                          <template v-if="file.file.type.startsWith('image/')">
                            <Img
                              v-if="file.src.startsWith('uploads/')"
                              :src="file.src"
                              alt="Server image"
                              class="w-full h-full object-contain"
                            />

                            <img
                              v-else
                              :src="file.src"
                              :alt="file.name"
                              class="w-full h-full object-contain"
                            />
                          </template>
                          <PIcon
                            v-else
                            source="NoteMajor"
                            class="w-72 h-72 fill-icon-default"
                          />
                        </div>

                        <div
                          class="pseudo pointer-events-auto bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 flex-centered"
                        >
                          <Tooltip v-slot="deleteTooltip" label="Remove" invert>
                            <div v-on="deleteTooltip.events">
                              <PIcon
                                source="DeleteMajor"
                                class="fill-white"
                                :class="{
                                  'pointer-events-auto cursor-pointer':
                                    !disabled,
                                }"
                                @click.stop="removeFile(i)"
                              />
                            </div>
                          </Tooltip>
                        </div>
                      </div>
                    </template>

                    <template #content>
                      <div v-if="file.alt" class="grid gap-y-8">
                        <p><strong>Name:</strong> {{ file.alt }}</p>

                        <p><strong>Type:</strong> {{ file.file.type }}</p>

                        <p><strong>Size:</strong> {{ file.size }}</p>
                      </div>

                      <p v-else>From server</p>
                    </template>
                  </Tooltip>
                </div>
              </div>
            </template>

            <p
              v-else-if="!plain"
              class="text-heading-sm font-semibold text-interactive-default"
            >
              Drop files to upload
            </p>
            <input
              v-if="showRootInput"
              :id="id || idProps.id"
              :tabindex="!plain ? '0' : '-1'"
              class="absolute inset-0 opacity-0 text-[transparent] appearance-none cursor-copy"
              :class="{
                'pointer-events-none': inputClickable,
              }"
              v-bind="inputAttrs.attrs"
              v-on="inputAttrs.events"
            />
          </div>

          <input
            v-if="!plain"
            type="text"
            tabindex="-1"
            class="sr-only"
            :required="required || undefined"
            :value="getFiles.length ? 'true' : ''"
          />

          <FadeTransition v-if="!disablePreview && !plain">
            <span
              v-if="getFiles.length && !active"
              class="absolute right-4 top-4 inline-block transition-[opacity,transform] opacity-30 group-hover:opacity-70 hover:opacity-100 active:opacity-90 active:scale-[0.99] pointer-events-auto"
              @click.stop="open"
            >
              <Tooltip v-slot="{ events }" :disabled="active" label="Maximize">
                <span v-on="events">
                  <PIcon
                    source="MaximizeMinor"
                    class="w-24 h-24 fill-icon-default"
                  />
                </span>
              </Tooltip>
            </span>
          </FadeTransition>
        </div>
      </template>

      <template #prepend="{ active }">
        <FadeTransition>
          <div v-if="active" class="bg-black/95 fixed inset-0" />
        </FadeTransition>
      </template>

      <template #content="{ active }">
        <div class="w-full h-full flex-centered">
          <div class="w-full h-[calc(100%-64px)] flex-centered">
            <div
              class="max-w-full h-full w-full max-h-[650px] p-10 rounded overflow-hidden transition-opacity"
              :class="{ 'opacity-0 duration-[250ms]': !active }"
              @click.stop
            >
              <template v-if="getFiles[0]">
                <Img
                  v-if="(getFiles[0] || {}).src.startsWith('uploads/')"
                  :src="(getFiles[0] || {}).src"
                  alt="Server image"
                  class="w-full h-full block rounded object-contain"
                />

                <img
                  v-else
                  :src="(getFiles[0] || {}).src"
                  :alt="(getFiles[0] || {}).alt"
                  class="w-full h-full block rounded object-contain"
                />
              </template>
            </div>
          </div>
        </div>
      </template>

      <template #append="{ close, overlayEntered, active }">
        <div
          v-if="active"
          class="pointer-events-none fixed inset-0 flex items-end z-10"
        >
          <div class="w-full h-80 flex-centered z-2 relative">
            <div
              class="transition-[opacity,transform] duration-300"
              :class="{ 'opacity-0 translate-y-[100%]': !overlayEntered }"
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
                <span class="flex items-center h-full">
                  <Tooltip invert>
                    <template #default="{ events }">
                      <span
                        aria-label="File info"
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
                      <div v-if="(getFiles[0] || {}).alt" class="grid gap-y-8">
                        <p>
                          <strong>Name:</strong>
                          {{ (getFiles[0] || {}).alt }}
                        </p>

                        <p>
                          <strong>Type:</strong>
                          {{ (getFiles[0] || {}).file.type }}
                        </p>

                        <p>
                          <strong>Size:</strong> {{ (getFiles[0] || {}).size }}
                        </p>
                      </div>

                      <p v-else>From server</p>
                    </template>
                  </Tooltip>

                  <hr class="h-[85%] w-1 border-r border-[rgb(75,75,75,0.7)]" />
                </span>

                <Tooltip
                  v-slot="{ events }"
                  invert
                  label="Remove"
                  class="h-full"
                >
                  <button
                    aria-label="Delete file"
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
                    aria-label="Replace file"
                    :for="id || idProps.id"
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
