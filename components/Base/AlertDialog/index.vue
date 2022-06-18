<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import UiDialog from '../UiDialog/index.vue'
import Button from '../Button/index.vue'
import Tooltip from '../Tooltip/index.vue'

export default defineComponent({
  name: 'BaseAlertDialog',
  components: { UiDialog, Button, Tooltip },
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  props: {
    modelValue: Boolean,
    actions: {
      type: Array as () => Vue['$alert']['actions'],
      required: true,
    },
    title: {
      type: String,
      default: '',
    },
    subtitle: {
      type: String,
      default: '',
    },
  },
  setup(_props, { emit }) {
    const modelSync = computed({
      get() {
        return _props.modelValue
      },
      set(val: boolean) {
        emit('update:modelValue', val)
      },
    })

    return { modelSync }
  },
})
</script>

<template>
  <UiDialog :key="$alert.key" v-model="modelSync" is-alert>
    <template #header>
      <div class="flex justify-start items-center">
        <Tooltip v-slot="{ events }" label="Go back">
          <button
            type="button"
            class="outline-none border-none focus:ring-2 ring-action-primary-default rounded ring-offset-2"
            v-on="events"
            @click="$router.go(-1)"
          >
            <span class="sr-only"> Go back </span>

            <span>
              <PIcon
                source="ExitMajor"
                class="fill-icon-default p-0 shrink-0"
              />
            </span>
          </button>
        </Tooltip>

        <span class="shrink-0 grow font-medium text-center ml-[-20px] font-sf-pro-display">
          {{ title }}
        </span>
      </div>
    </template>

    <div class="lg:min-w-[450px]">
      <p v-if="subtitle" class="text-text-subdued text-center font-sf-pro-display">
        {{ subtitle }}
      </p>

      <div class="flex items-center justify-end space-x-16 mt-32 lg:mt-32">
        <Button
          v-for="({ attrs, label, events }, i) in actions"
          :key="i"
          v-bind="attrs"
          v-on="events"
        >
          {{ label }}
        </Button>
      </div>
    </div>
  </UiDialog>
</template>
