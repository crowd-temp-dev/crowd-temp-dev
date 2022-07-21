<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { Layout } from '~/types'
import { splitPath } from '~/utils'
import { dynamicPageTransition } from '~/utils/pageTransition'

export default defineComponent({
  name: 'AppTrashPage',
  components: {},
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

  head: {
    title: 'Trash',
    meta: [
      {
        name: 'description',
        content: 'View recently deleted tests',
        vmid: 'description',
        hid: 'description',
      },
    ],
  },
})
</script>

<template>
  <div class="w-full p-32">
    <div class="max-w-app mx-auto">
      <h2 class="text-heading leading-[20px] text-text-subdued mb-10">
        Trash items will be deleted after 30 days
      </h2>
    </div>
  </div>
</template>
