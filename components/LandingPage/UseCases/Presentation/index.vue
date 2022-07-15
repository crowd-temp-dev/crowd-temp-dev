<script lang="ts">
import { computed, defineComponent, nextTick, ref } from '@vue/composition-api'
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

    const imageLoaded = ref(false)

    const imageHovered = ref(false)

    const getCurrentItem = computed({
      get() {
        return currentItem.value
      },
      async set(val: number) {
        imageLoaded.value = false

        await nextTick()

        currentItem.value = val
      },
    })

    return { currentItem, imageHovered, getCurrentItem, imageLoaded }
  },
})
</script>

<template>
  <section id="use-cases" class="mb-162">
    <h2 class="sr-only">Use cases</h2>

    <div class="flex space-x-30 mx-auto w-full justify-between">
      <ViewBox
        :current-item="getCurrentItem"
        @image-hovered="(evt) => (imageHovered = evt)"
        @image-loaded="imageLoaded = true"
      />

      <List
        v-model="getCurrentItem"
        :image-hovered="imageHovered || !imageLoaded"
      />
    </div>
  </section>
</template>
