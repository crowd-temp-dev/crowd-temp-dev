
<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { Layout } from '~/types'

export default defineComponent({
  name: 'IndexPage',
  layout: 'action' as Layout,
  transition: 'page-transition-slide-left',
})
</script>

<template>
  <div>
    Route action
  </div>
</template>
