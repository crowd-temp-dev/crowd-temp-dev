<template>
  <figure class="StickyNote inline-block" :class="[`${type}-type`]">
    <PImage
      :source="`/png/landing-page/hero/sticky-notes/${type}.png`"
      alt="Sticky note user image"
      :width="$breakpoint.isMobile ? 25.63 : 50"
      :height="$breakpoint.isMobile ? 25.63 : 50"
      class="img"
    />

    <figcaption
      class="caption"
      :style="{
        '--bg': color,
      }"
    >
      {{ caption }}
    </figcaption>
  </figure>
</template>

<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api'

export type StickyNoteType = 'blue' | 'yellow' | 'green'

type KeyOfType<T> = {
  [key in StickyNoteType]: T
}

const captions: KeyOfType<string> = {
  green: 'I love this product! Looks pretty straighforward for me',
  yellow: 'I think the prototype looks great, was easy to navigate',
  blue: 'I think the value of each pricing plan could be clearer',
}

const colors: KeyOfType<string> = {
  blue: '#C6FCFF',
  yellow: '#FDF4A7',
  green: '#B1F9C9',
}

export default defineComponent({
  name: 'LandingPageHeroStickyNote',
  props: {
    type: {
      type: String as () => StickyNoteType,
      default: 'blue',
    },
  },
  setup(_props) {
    const props = computed(() => _props)

    const caption = computed(() => captions[props.value.type])
    const color = computed(() => colors[props.value.type])

    return { caption, color }
  },
})
</script>

<style scoped lang="postcss">
.StickyNote {
  @apply relative isolate;
}

.StickyNote.green-type .img {
  @apply -left-21 md:-left-42 -top-12 md:-top-24;
}

.StickyNote.yellow-type .img {
  @apply -left-21 md:-left-42 -top-17 md:-top-34;
}

.StickyNote.blue-type .img {
  @apply -right-3 -top-47;
}

.img {
  @apply h-[25.63px] w-[25.63px] md:h-50 md:w-50 rounded-full absolute z-1;
}

.StickyNote.green-type .caption {
  @apply rotate-[2.27deg] w-[102.52px] md:w-200 h-[33.4px] md:h-64 text-[6.15px] md:text-[12px] leading-[8.2px] md:leading-[16px];
}

.StickyNote.yellow-type .caption {
  @apply w-[85.13px] md:w-200 h-[37.84px] md:h-88 text-[5.11px] md:text-[12px] leading-[6.81px] md:leading-[16px] rotate-[4.74deg];
}

.StickyNote.blue-type .caption {
  @apply rotate-[-5.2deg] h-64;
}

.caption {
  box-shadow: 0px 3px 4px rgba(0, 0, 0, 0.5);
  background-color: var(--bg);
  @apply p-[8.2px] md:p-16 w-200 text-[12px] leading-[16px] font-roboto text-left;
}
</style>
