<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api'
import Button from '@/components/Base/Button/index.vue'
import SmoothDrag from '~/components/Base/SmoothDrag/index.vue'
import { uid } from '~/utils'
import Tooltip from '~/components/Base/Tooltip/index.vue'

export default defineComponent({
  name: 'AppCreateTestStepsCardSortingSortableSection',
  components: { Button, SmoothDrag, Tooltip },
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    actionText: {
      type: String,
      required: true,
    },
    modelValue: {
      type: Array as () => string[],
      required: true,
    },
    tooltipContent: {
      type: String,
      required: true,
    },
  },
  setup(_props, { emit }) {
    const id = ref(uid())

    const modelSync = computed({
      get() {
        return _props.modelValue
      },
      set(val: string[]) {
        emit('update:modelValue', val)
      },
    })

    const questionAdded = ref(false)

    const removeField = (field: string) => {
      modelSync.value = modelSync.value.filter((x) => x !== field)
    }

    const addField = () => {
      modelSync.value = [...modelSync.value, '']

      questionAdded.value = true

      requestAnimationFrame(() => {
        const newChoiceInput = document.querySelector(
          `#${id.value}-${modelSync.value.length - 1} input`
        ) as HTMLInputElement

        if (newChoiceInput) {
          newChoiceInput.focus()

          newChoiceInput.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
        }
      })
    }

    return { id, modelSync, removeField, addField, questionAdded }
  },
})
</script>

<template>
  <div>
    <PHorizontalDivider class="w-[88%] mb-20" />

    <p class="text-[16px] leading-[20px] mb-20 flex items-center space-x-8">
      <strong>
        {{ title }}
      </strong>

      <Tooltip>
        <template #default="{ events }">
          <span v-on="events">
            <PIcon source="InfoMinor" class="fill-icon-default" />
          </span>
        </template>

        <template #content>
          <div class="max-w-[240px] text-body">
            <VHTML :text="tooltipContent" />
          </div>
        </template>
      </Tooltip>
    </p>

    <p
      v-if="!modelSync.length"
      class="ml-30 text-text-subdued font-semibold grid grid-flow-col items-center justify-start"
    >
      <PIcon source="AlertMinor" class="fill-icon mr-8" />
      Nothing to show
    </p>

    <SmoothDrag
      v-else
      v-model="modelSync"
      group-tag="ul"
      group-class="grid gap-y-24"
    >
      <li
        v-for="(field, i) in modelSync"
        :id="`${id}-${i}`"
        :key="`${id}-${i}`"
        class="flex items-center"
        :class="{ 'fade-appear': questionAdded }"
      >
        <PIcon
          source="DragHandleMinor"
          class="fill-icon-default w-16 h-16 shrink-0 drag-handle transition-opacity"
          :class="{ 'pointer-events-none opacity-20': modelSync.length < 2 }"
        />

        <TextField
          v-model="modelSync[i]"
          class="flex-grow ml-14 mr-12"
          type="text"
          required
        />

        <PIcon
          source="DeleteMinor"
          class="fill-icon-default w-16 h-16 shrink-0"
          :class="{ 'pointer-events-none opacity-20': modelSync.length < 3 }"
          @click="removeField(field)"
        />
      </li>
    </SmoothDrag>

    <Button
      primary
      class="mt-24 ml-30 mb-40"
      :disabled="modelSync.length >= 50"
      @click="addField"
    >
      {{ actionText }}
    </Button>
  </div>
</template>
