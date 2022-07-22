<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { splitPath } from '~/utils'
import { dynamicPageTransition } from '~/utils/pageTransition'

export default defineComponent({
  name: 'AppCreateTestViewResultUserSessionsPage',
  components: {},

  transition: (to, from) => {
    const splitFrom = splitPath(from?.path || '')

    if (splitFrom[2] === 'view-result') {
      if (/comments/.test(splitFrom[3])) {
        return 'page-transition-slide-right'
      }
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
    title: 'Test results analytics',
  },
})
</script>

<template>
  <div>NestedQ</div>
</template>
