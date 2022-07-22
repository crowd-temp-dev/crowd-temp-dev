<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { splitPath } from '~/utils'
import { dynamicPageTransition } from '~/utils/pageTransition'
import CommentSection from '~/components/App/CommentSection/index.vue'

export default defineComponent({
  name: 'AppCreateTestViewResultUserSessionsPage',
  components: { CommentSection },

  transition: (to, from) => {
    const splitFrom = splitPath(from?.path || '')

    if (splitFrom[2] === 'view-result') {
      return 'page-transition-slide-left'
    }

    return dynamicPageTransition({
      to,
      from,
    })
  },

  setup() {},

  fetch() {},

  head: {
    title: 'Test results comments',
  },
})
</script>

<template>
  <div>
    <div class="rounded-lg pb-20 pt-42 bg-surface-default shadow-2">
      <h2
        class="font-sf-pro-display px-20 mb-20 font-semibold text-[20px] leading-[32px]"
      >
        Result comments
      </h2>

      <div class="px-20 mb-40">
        <hr class="w-full h-1 border-t" />
      </div>
      <CommentSection />
    </div>
  </div>
</template>
