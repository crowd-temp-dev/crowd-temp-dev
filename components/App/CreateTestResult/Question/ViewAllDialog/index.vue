<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import UiDialog from '~/components/Base/UiDialog/index.vue'
import Button from '~/components/Base/Button/index.vue'

export default defineComponent({
  name: 'AppCreateTestResultsQuestionViewAllDialog',
  components: {
    UiDialog,
    Button,
  },
  setup() {
    const active = ref(false)

    return { active }
  },
})
</script>

<template>
  <span>
    <Button plain @click="active = true"> View all </Button>

    <UiDialog v-model="active" transition="slide-y-reverse">
      <template #header="props">
        <slot name="dialog-header" v-bind="props" />
      </template>

      <template #default="props">
        <slot name="dialog" v-bind="props" />
      </template>
    </UiDialog>
  </span>
</template>
