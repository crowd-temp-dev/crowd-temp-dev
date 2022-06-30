<script lang="ts">
import { defineComponent, nextTick, ref } from '@vue/composition-api'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'
import { sleep } from '~/utils'

export default defineComponent({
  name: 'AppCreateTestResultCardSortingItem',
  components: { FadeTransition },
  props: {
    category: {
      type: String,
      required: true,
    },
    cards: {
      type: Array as () => {
        title: string
        repeated: number
      }[],
      required: true,
    },
  },
  setup() {
    const expanded = ref(false)

    const rootRef = ref<HTMLElement>(null)

    const thead = [
      {
        title: 'Cards',
        class: 'w-full text-left',
      },
      {
        title: 'Frequency',
        class: 'pr-20',
      },
      {
        title: 'Agreement',
        class: 'text-right',
      },
    ]

    const toggleExpand = async () => {
      expanded.value = !expanded.value

      await nextTick()

      if (expanded.value) {
        await sleep(300)

        if (rootRef.value) {
          const rootEl = rootRef.value

          const { top, bottom } = rootEl.getBoundingClientRect()

          if (top < 56 + 76 || bottom > innerHeight) {
            rootRef.value.scrollIntoView({
              block: 'center',
              behavior: 'smooth',
            })
          }
        }
      }
    }
    return { expanded, thead, rootRef, toggleExpand }
  },
})
</script>

<template>
  <div ref="rootRef" class="rounded-[3px] border border-divider">
    <p class="h-60 flex items-center border-b border-divider p-20">
      <strong class="text-text-subdued">
        {{ category }}
      </strong>
    </p>

    <div class="min-h-[62px] bg-surface-subdued p-20 flex items-start">
      <FadeTransition>
        <div v-if="expanded" class="w-full mr-20">
          <table class="w-full">
            <thead>
              <th
                v-for="item in thead"
                :key="item.title"
                class="text-text-subdued font-normal text-[13px] uppercase"
                :class="item.class"
              >
                {{ item.title }}
              </th>
            </thead>

            <tbody>
              <tr
                v-for="(card, cardIndex) in cards"
                :key="cardIndex"
                class="h-60"
              >
                <td>
                  {{ card.title }}
                </td>

                <td class="text-right pr-20">
                  {{ card.repeated }}
                </td>

                <td class="text-right">100%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <ul v-else class="grow grid grid-flow-col gap-8 justify-start">
          <li
            v-for="(card, cardIndex) in cards"
            :key="cardIndex"
            class="flex items-center justify-center space-x-4 h-22 rounded-[10px] py-2 px-8 min-w-[82px] bg-surface-neutral-default text-[13px] leading-[16px] w-fit"
          >
            <span>
              {{ card.title }}
            </span>

            <span
              class="inline-flex justify-center items-center text-white w-14 h-14 rounded-full bg-icon-default text-[10px] leading-[12px]"
            >
              {{ card.repeated }}
            </span>
          </li>
        </ul>
      </FadeTransition>

      <Button plain @click="toggleExpand">
        <div class="flex-centered">
          <PIcon
            :source="expanded ? 'CaretUpMinor' : 'CaretDownMinor'"
            class="fill-icon text-icon-default"
          />
          <span class="sr-only">Expand</span>
        </div>
      </Button>
    </div>
  </div>
</template>
