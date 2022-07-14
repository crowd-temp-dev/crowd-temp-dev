<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import ViewBox from './ViewBox/index.vue'
import List from './List/index.vue'

export default defineComponent({
  name: 'LandinPageUseCases',
  components: {
    ViewBox,
    List,
  },
  setup() {
    const currentItem = ref(0)

    const imageHovered = ref(false)

    return { currentItem, imageHovered }
  },
})
</script>

<template>
  <section class="mb-162">
    <h2 class="sr-only">Use cases</h2>

    <div class="flex space-x-30">
      <ViewBox
        :current-item="currentItem"
        @image-hovered="(evt) => (imageHovered = evt)"
      />

      <List v-model="currentItem" :image-hovered="imageHovered" />
    </div>
  </section>
</template>
