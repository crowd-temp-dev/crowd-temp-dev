<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import DialogButton from '../../../../Base/DialogButton/index.vue'
import Item from './Item/index.vue'
import { RootState } from '~/store'

export default defineComponent({
  name: 'AppProjectResultPreviewQuestion',
  components: { DialogButton, Item },
  props: {
    title: {
      type: String,
      required: true,
    },
  },
  setup(_props, { root: { $store } }) {
    const getIndex = computed(() => {
      return parseFloat((_props.title.match(/^\d+\./g) || [])[0])
    })

    const questions = computed(() => {
      const index = getIndex.value

      if (!index) {
        return []
      }

      const getQuestion = ($store.state as RootState).projectSuite.viewResult
        .questions[`question-${index}`]

      return getQuestion
    })

    return { getIndex, questions }
  },
})
</script>

<template>
  <DialogButton
    label="Preview Questions dialog"
    dialog-content-class="h-full w-[600px] justify-self-end"
    plain
    :dialog-attrs="{
      asDrawer: true,
    }"
  >
    <span> Preview questions </span>

    <template #dialog-header>
      <strong>{{ title }}</strong>
    </template>

    <template #dialog>
      <div>
        <Item
          v-for="(question, i) in questions.followUpQuestions"
          :key="i"
          :index="i"
          :question="question"
          :class="{ 'mt-16': !!i }"
        />
      </div>
    </template>
  </DialogButton>
</template>
