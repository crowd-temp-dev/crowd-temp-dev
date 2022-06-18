<template>
  <div>Billing</div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { Layout } from '~/types'
import { splitPath } from '~/utils'
import { dynamicPageTransition } from '~/utils/pageTransition'

export default defineComponent({
  name: 'AppBillingPage',
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

  // TODO!!!
  head: {
    title: 'Home',
  },
})
</script>

<style lang="postcss"></style>
