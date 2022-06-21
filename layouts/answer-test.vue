<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api'
import HeaderLogo from '~/components/Base/HeaderLogo/index.vue'
import { answerTestMiddleware } from '~/utils/layout'
import layouts from '~/mixins/layouts'
import { AnswerTestState } from '~/store/answer-test'
import { answerTestLoadingId } from '~/utils'

export default defineComponent({
  name: 'AnswerTestLayout',
  components: { HeaderLogo },
  mixins: [layouts],
  middleware: answerTestMiddleware,
  // transition: 'answer-page-transition',
  setup(_, { root }) {
    const answerForm = computed(() => {
      return (root.$store.state['answer-test'] as AnswerTestState).form
    })

    if (answerForm.value.empty) {
      // show loading until form has been populated
      root.$fullscreenLoading.show({
        message: 'Loading...',
        id: answerTestLoadingId,
        fadeAppear: false,
      })
    }
  },
})
</script>

<template>
  <div :class="{ 'hide-ui': !mounted }">
    <!-- Layout for answering tests -->
    <div
      role="document"
      class="grid grid-rows-[56px,1fr] min-h-screen min-w-screen h-screen w-screen"
    >
      <header
        id="app-header"
        class="h-56 sticky top-0 bg-surface-default z-10 shadow-2 flex items-center px-16 w-full"
      >
        <HeaderLogo />
      </header>

      <main
        ref="main"
        class="h-full w-full max-h-full overflow-y-auto overflow-x-hidden bg-surface-default isolate overscroll-contain"
      >
        <NuxtChild />
      </main>
    </div>
  </div>
</template>
