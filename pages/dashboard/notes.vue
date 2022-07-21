<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { Layout } from '~/types'
import { splitPath } from '~/utils'
import { dynamicPageTransition } from '~/utils/pageTransition'
import SearchField from '~/components/Base/SearchField/index.vue'
import NoteSection from '~/components/App/Notes/NoteSection/index.vue'

export default defineComponent({
  name: 'AppNotesPage',
  components: { SearchField, NoteSection },
  layout: 'app' as Layout,
  transition: (to, from) =>
    dynamicPageTransition({
      to,
      from,
      useFade:
        !from ||
        splitPath(to.path).length === splitPath(from?.path || '').length,
    }),
  setup() {},

  // TODO!!!
  head: {
    title: 'Home',
  },
})
</script>

<template>
  <div class="w-full py-32 px-32">
    <div class="max-w-app mx-auto">
      <div class="max-w-[800px]">
        <SearchField
          placeholder="Search tests"
          class="bg-surface-default mb-16 max-w-[270px] h-36"
          outlined
        />

        <div class="grid gap-y-32">
          <NoteSection />

          <NoteSection />
        </div>
      </div>
    </div>
  </div>
</template>
