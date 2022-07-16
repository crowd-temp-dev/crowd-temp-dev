<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api'
import StickyNote, { StickyNoteType } from '../StickyNote/index.vue'

export default defineComponent({
  name: 'LandingPageStickyNoteWrapper',
  components: { StickyNote },
  setup(_, { root: { $breakpoint } }) {
    const notes = computed(() => {
      return ['green', 'yellow', 'blue'].filter((_, i) =>
        $breakpoint.isMobile ? i < 2 : true
      ) as StickyNoteType[]
    })

    return {
      notes,
    }
  },
})
</script>

<template>
  <div
    class="absolute w-full max-w-[1110px] mx-auto h-full inset-0 pointer-events-none"
  >
    <StickyNote
      v-for="(note, i) in notes"
      :key="note"
      :type="note"
      class="!absolute pointer-events-auto"
      :class="{
        'top-0 left-[calc(50%--14px)] md:left-[calc(50%-24px)]': i === 0,
        'left-72 md:left-0 top-52 md:top-[225.97px]': i === 1,
        '-right-16 xl-right-0 top-[174.92px]': i === 2,
      }"
    />
  </div>
</template>
