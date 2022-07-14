<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'

export default defineComponent({
  name: 'LandinPageUseCasesPresentationView',
  components: { FadeTransition },
  props: {
    currentItem: {
      type: Number,
      required: true,
    },
  },
})
</script>

<template>
  <div
    id="presentation-view-box"
    class="h-[584px] w-full rounded-[22px] relative"
  >
    <div
      class="pseudo bg-surface-selected-pressed -z-1 !-top-16 !-left-16 rounded-[inherit] h-[inherit] w-[inherit]"
    />

    <div
      class="rounded-[inherit] h-[inherit] w-[inherit] pl-49 pt-66"
      :style="{
        'background-image':
          'linear-gradient(122.49deg, #FBFFFF 1.03%, #FAFBFB 99.27%)',
        filter:
          'drop-shadow(0.5px 1px 1px rgb(0, 0, 0, 0.035)) drop-shadow(-3px -1px 3px hsl(215, 26%, 60%, 0.075)) drop-shadow(-4px -3px 4px hsl(215, 46%, 75%, 0.025))',
      }"
    >
      <div
        class="h-360 w-[505px] rounded-[18px] bg-surface-default z-1 relative"
      >
        <FadeTransition>
          <div
            :key="currentItem"
            class="w-full h-full"
            @mouseenter="$emit('image-hovered', true)"
            @mouseout="$emit('image-hovered', false)"
          >
            <Img
              :src="`static/png/landing-page/use-cases/presentation/view/home`"
              :alt="`Home view`"
            />
          </div>
        </FadeTransition>
      </div>
    </div>
  </div>
</template>
