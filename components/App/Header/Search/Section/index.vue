<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { pseudoFocusOnMouseEnter } from '~/utils'

export type AppHeaderSearchSectionType = 'tests' | 'notes'

export interface AppHeaderSearchSectionItem {
  title: string
  to: string
  meta?: Record<string, any>
}

export default defineComponent({
  name: 'AppHeaderSearchSection',
  props: {
    type: {
      type: String as () => AppHeaderSearchSectionType,
      required: true,
    },

    items: {
      type: Array as () => AppHeaderSearchSectionItem[],
      required: true,
    },
  },

  setup() {
    return { pseudoFocusOnMouseEnter }
  },
})
</script>

<template>
  <section v-if="items && items.length">
    <h3
      class="px-10 text-text-subdued text-caption uppercase mb-10 font-semibold"
    >
      {{ type }}
    </h3>

    <ul class="grid" :class="{ 'gap-20': type === 'notes' }">
      <li
        v-for="(item, i) in items"
        :key="i"
        class="pseudo-focus hover:bg-background-default/30"
        @mouseenter="pseudoFocusOnMouseEnter"
      >
        <NuxtLink
          tabindex="-1"
          :to="item.to"
          class="rounded-[3px] font-medium p-10"
          :class="{
            'justify-between items-center flex': type === 'tests',
            grid: type === 'notes',
          }"
        >
          <template v-if="type === 'tests'">
            <span class="flex-grow">
              {{ item.title }}
            </span>

            <PIcon source="ExternalMinor" class="fill-[#868686] shrink-0" />
          </template>

          <template v-if="type === 'notes'">
            <div class="flex justify-between items-center mb-8">
              <span class="flex-grow">
                {{ item.title }}
              </span>

              <PIcon source="ExternalMinor" class="fill-[#868686] shrink-0" />
            </div>

            <div
              class="bg-surface-subdued p-20 rounded-[3px] border border-divider flex items-center"
            >
              <div class="flex items-center shrink-0 mr-16">
                <PIcon source="NoteMajor" class="fill-icon-default mr-4" />

                <strong> Q.1 | Participant 1: </strong>
              </div>

              <div>
                <strong>Merchant</strong>

                <span class="font-semibold text-text-subdued">
                  appears to be on Wix but has a link to "View more plans" even
                  though there aren't any more.
                </span>
              </div>
            </div>
          </template>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>

<style scoped lang="postcss">
.pseudo-focus[data-pseudo-focus] {
  @apply bg-background-default;
}
</style>
