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

<template>
  <div>
    <aside class="w-240" :class="{ 'sticky top-96 xl:top-108': false }">
      <p class="mb-8 font-medium">Your notes</p>

      <ul v-if="false" class="grid mb-24 gap-y-8">
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

      <p v-else class="text-text-subdued flex items-center space-x-4 mb-10">
        No notes yet. Add notes by clicking on note icon on responses or button
        below.
      </p>

      <DialogButton
        icon="CirclePlusMinor"
        full-width
        class="bg-surface-default"
        :dialog-content-class="['min-w-[618px]']"
        :dialog-attrs="{
          transition: 'slide-y',
        }"
      >
        Add new note

        <template #dialog-header>
          <Tooltip v-slot="{ events }" label="Click to edit" open-delay="100" class="w-fit">
            <EditableText fallback="Note: Q1 | Participant 1" v-on="events" />
          </Tooltip>
        </template>

        <template #dialog>
          <TextField
            label="Your message or instructions"
            multiline
            :min-height="72"
            autofocus
          />
        </template>

        <template #dialog-footer="{ close }">
          <Button primary @click="close"> Save </Button>
        </template>
      </DialogButton>
    </aside>
  </div>
</template>
