<script lang="ts">
import { defineComponent, computed, ref } from '@vue/composition-api'
import { QuestionModelValue } from '../type'
import Button from '~/components/Base/Button/index.vue'
import { uid } from '~/utils'
import SmoothDrag from '~/components/Base/SmoothDrag/index.vue'
import Select from '~/components/Base/Select/index.vue'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'

export default defineComponent({
  name: 'AppCreateTestStepsFollowUpQuestionQuestionmodelSync',
  components: { Button, SmoothDrag, Select, FadeTransition },
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  props: {
    showMaxSelection: Boolean,
    minLength: {
      type: Number,
      default: 2,
    },
    modelValue: {
      type: Object as () => QuestionModelValue['choices'],
      required: true,
    },
    idAndError: {
      type: Function,
      required: true,
    },
  },
  setup(_props, { emit }) {
    const props = computed(() => _props)
    const id = ref(uid())

    const checkboxId = computed(() => `checkbox-${id.value}`)

    const modelSync = computed<QuestionModelValue['choices']>({
      get() {
        return _props.modelValue
      },
      set(val: QuestionModelValue['choices']) {
        emit('update:modelValue', val)
      },
    })

    const addChoice = () => {
      modelSync.value = {
        ...modelSync.value,
        options: [...modelSync.value.options, ''],
      }

      requestAnimationFrame(() => {
        const newChoiceInput = document.querySelector(
          `#${id.value}-${modelSync.value.options.length - 1} input`
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

    const removeChoice = (index: number) => {
      if (modelSync.value.options.length > props.value.minLength) {
        const newOptions = modelSync.value.options.filter((_, i) => i !== index)

        modelSync.value = {
          ...modelSync.value,
          options: newOptions,
        }
      }
    }

    return {
      id,
      checkboxId,
      modelSync,
      addChoice,
      removeChoice,
    }
  },
})
</script>

<template>
  <div>
    <p class="mb-4 mt-18">Choices</p>

    <SmoothDrag
      v-model="modelSync.options"
      group-tag="ul"
      group-class="grid gap-y-24"
      :disabled="modelSync.options.length < 1"
    >
      <li
        v-for="(choice, i) in modelSync.options"
        :id="`${id}-${i}`"
        :key="`${i}`"
        class="flex items-center"
        :class="{ 'fade-appear': modelSync.options.length > 2 }"
      >
        <span
          class="cursor-grab active:cursor-grabbing transition-opacity inline-block"
          :class="{
            'pointer-events-none opacity-20': modelSync.options.length < 2,
            'mb-[calc(20px+0.4rem)] mt-0': idAndError(`${id}-${i}`).error,
          }"
        >
          <PIcon
            source="DragHandleMinor"
            class="shrink-0 fill-icon-default w-16 h-16 drag-handle"
          />
        </span>

        <TextField
          v-model="modelSync.options[i]"
          class="mr-12 ml-14 flex-grow shrink-0"
          type="text"
          required
          v-bind="idAndError(`${id}-${i}`)"
        />

        <PIcon
          source="DeleteMajor"
          class="fill-icon-default w-16 h-16 transition-opacity"
          :class="{
            'pointer-events-none opacity-20':
              modelSync.options.length < minLength + 1,
            'mb-[calc(20px+0.4rem)] mt-0': idAndError(`${id}-${i}`).error,
          }"
          @click="removeChoice(i)"
        />
      </li>
    </SmoothDrag>

    <div class="mt-24 ml-30">
      <div class="flex items-center space-x-44 mb-20">
        <Button primary @click="addChoice"> Add new choice </Button>

        <FadeTransition duration="200">
          <Select
            v-if="showMaxSelection"
            v-model="modelSync.maxSelection"
            :options="
              Array.from({ length: 10 }, (_, i) => ({
                label: `${i + 1}`,
                value: `${i + 1}`,
              }))
            "
            mandatory
            value="2"
            label="Max selection"
            bold-label
            wrapper-class="min-w-[72px]"
          />
        </FadeTransition>
      </div>

      <div class="flex items-center">
        <Checkbox
          :id="checkboxId"
          v-model="modelSync.addOtherAsChoice"
          class="m-0"
        />

        <label
          :for="checkboxId"
          class="uppercase text-sub-heading text-text-subdued font-semibold cursor-pointer"
        >
          Add "other" as choice
        </label>
      </div>
    </div>
  </div>
</template>
