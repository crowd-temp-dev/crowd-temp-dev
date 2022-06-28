<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import DialogButton from '../../../../Base/DialogButton/index.vue'

export default defineComponent({
  name: 'AppCreateTestResultQuestionSectionDialog',
  components: { DialogButton },
  props: {

  },
  setup() {},
})
</script>

<template>
  <DialogButton
    label="Preview Questions"
    dialog-content-class="h-full w-[600px] justify-self-end"
    plain
    :dialog-attrs="{
      asDrawer: true,
    }"
  >
    <span> Previous questions </span>

    <template #dialog-header>
      <p>View questions</p>
    </template>

    <template #dialog>
      <div>
        <Button>
          Hi
        </Button>
      </div>
    </template>
  </DialogButton>
</template>
