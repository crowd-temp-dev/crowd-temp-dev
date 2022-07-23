<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { Layout } from '~/types'
import Form from '~/components/App/SetupProfile/Form/index.vue'

export default defineComponent({
  name: 'IndexPage',
  components: { Form },
  layout: 'app' as Layout,
  transition: 'page-transition-slide-left',
  fetch(ctx) {
    if (ctx.$user.onboarded) {
      ctx.redirect('/dashboard')
    }
  },
})
</script>

<template>
  <main
    ref="main"
    class="h-full max-h-full grid justify-items-center pt-[5%] pb-120 w-screen overflow-x-hidden isolate overscroll-contain windows-os-self:lock-html-scroll:pr-4"
    :class="{
      'overflow-y-auto': !$appState.dialogs.length,
      'overflow-hidden': $appState.dialogs.length,
    }"
  >
    <Form />
  </main>
</template>
