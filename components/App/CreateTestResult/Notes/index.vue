<template>
  <div>
    <aside class="w-240 sticky top-96 xl:top-108">
      <p class="mb-8 font-medium">Your notes</p>

      <ul class="grid mb-24 gap-y-8">
        <li
          v-for="i in 2"
          :key="i"
          class="flex w-full items-center justify-between h-52 bg-surface-default rounded-[3px] px-10 py-4"
        >
          <div class="flex items-center space-x-7 mr-8">
            <PIcon source="NoteMajor" class="fill-icon-default" />

            <p class="truncate">Q.{{ i }} | Participant 1</p>
          </div>

          <Button plain> View </Button>
        </li>
      </ul>

      <DialogButton
        icon="CirclePlusMinor"
        full-width
        class="bg-surface-default"
        :dialog-content-class="['min-w-[618px]']"
      >
        Add new note

        <template #dialog-header>
          <EditableText fallback="Note: Q1 | Participant 1" />
        </template>

        <template #dialog>
          <TextField
            label="Your message or instructions"
            multiline
            :min-height="72"
          />
        </template>

        <template #dialog-footer="{ close }">
          <Button primary @click="close"> Save </Button>
        </template>
      </DialogButton>
    </aside>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import Button from '~/components/Base/Button/index.vue'
import DialogButton from '~/components/Base/DialogButton/index.vue'
import EditableText from '~/components/Base/EditableText/index.vue'

export default defineComponent({
  name: 'AppCreateTestResultsNotes',
  components: { Button, DialogButton, EditableText },
  setup() {
    const modal = ref(false)

    return { modal }
  },
})
</script>

<style scoped></style>
