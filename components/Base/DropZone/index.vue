<script lang="ts">
import { defineComponent, computed, ref } from '@vue/composition-api'
import Tooltip from '../Tooltip/index.vue'
import { convertToByte, formatByte } from '~/utils'

export default defineComponent({
  name: 'DropZone',
  components: { Tooltip },

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
              duration: 4000
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
      onChange,
      dragEnter,
      getFiles,
      removeFile,
      openInput,
      input,
      onDrop,
      inputAttrs,
    }
  },
})
</script>

<template>
  <Id v-slot="{ id }">
    <div
      class="min-h-[200px] p-[1.5rem] rounded-lg border-dashed border-2 relative isolate cursor-pointer transition-all active:scale-[0.9975] focus-within:ring-2 ring-offset-2 ring-action-primary-default"
      :class="{
        'border-border-default hover:bg-surface-hovered': !dragEnter,
        'bg-surface-default': !getFiles.length,
        'bg-surface-hovered': getFiles.length,
        'border-interactive-default bg-surface-selected-default': dragEnter,
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
    </div>
  </Id>
</template>
