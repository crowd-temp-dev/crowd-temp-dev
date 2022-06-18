<template>
  <section
    class="bg-surface-default rounded-lg shadow-2 w-full max-w-[800px] p-20"
  >
    <!-- <header> -->
    <div class="flex h-52 items-center justify-between mb-10">
      <div class="flex items-center space-x-24">
        <h2
          class="font-sf-pro-display font-semibold text-[20px] leading-[32px]"
        >
          New Test
        </h2>

        <p class="text-text-subdued">Last updated 4 mins ago</p>
      </div>

      <div class="flex items-center">
        <p class="text-button text-text-subdued mr-16">3 notes</p>

        <Button> View test </Button>
      </div>
    </div>
    <!-- </header > -->

    <PHorizontalDivider
      class="w-full transition-[margin]"
      :class="{
        'mb-20': expanded,
      }"
    />

    <!-- <body> -->
    <FadeTransition :duration="{ enter: 200, leave: 0 }">
      <ul v-if="expanded" class="grid gap-y-20">
        <li
          v-for="i in 3"
          :key="i"
          class="flex border-divider border h-fit rounded-[3px] p-20 pr-0 items-center"
        >
          <div class="flex items-center mr-10 md:shrink-0">
            <PIcon source="NoteMajor" class="fill-icon-default" />

            <p class="font-semibold ml-6">Q.1 | Participant 1:</p>
          </div>

          <p class="font-semibold text-text-subdued">
            Merchant appears to be on Wix but has a link to "View more plans"
            even though there aren't any more.
          </p>
        </li>
      </ul>
    </FadeTransition>
    <!-- </body > -->

    <div class="pt-6 text-center pb-6 mt-20">
      <Button
        :disclosure="expanded ? 'up' : 'down'"
        plain
        @click="expanded = !expanded"
      >
        {{ expanded ? 'Collapse' : 'Expand' }}
      </Button>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import Button from '@/components/Base/Button/index.vue'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'

export default defineComponent({
  name: 'AppNotesNoteSection',
  components: { Button, FadeTransition },
  setup() {
    const expanded = ref(true)

    return { expanded }
  },
})
</script>
