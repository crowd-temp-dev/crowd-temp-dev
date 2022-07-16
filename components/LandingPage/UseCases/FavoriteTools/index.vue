<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api'
import Tooltip from '~/components/Base/Tooltip/index.vue'
import FigmaIcon from '~/components/Base/Icon/FigmaIcon.vue'
import SketchIcon from '~/components/Base/Icon/SketchIcon.vue'
import MarvelIcon from '~/components/Base/Icon/MarvelIcon.vue'
import InVisionIcon from '~/components/Base/Icon/InVisionIcon.vue'
import AdobeIcon from '~/components/Base/Icon/AdobeIcon.vue'

type Icon = {
  title:
    | 'FigmaIcon'
    | 'InVisionIcon'
    | 'AdobeIcon'
    | 'SketchIcon'
    | 'MarvelIcon'
  label: 'Figma' | 'InVision' | 'Adobe' | 'Sketch' | 'Marvel'
  class?: string
}

export default defineComponent({
  name: 'LandinPageUseCasesFavoriteTools',
  components: {
    Tooltip,
    FigmaIcon,
    SketchIcon,
    MarvelIcon,
    InVisionIcon,
    AdobeIcon,
  },

  setup(_, { root: { $breakpoint } }) {
    const icons = computed<Icon[] | {}[]>(() => {
      const value = [
        {
          title: 'FigmaIcon',
          label: 'Figma',
        },
        {
          title: 'AdobeIcon',
          label: 'Adobe',
        },
        {
          title: 'InVisionIcon',
          label: 'InVision',
        },
        {
          title: 'SketchIcon',
          label: 'Sketch',
        },
        {
          title: 'MarvelIcon',
          label: 'Marvel',
        },
      ]

      if ($breakpoint.isMobile) {
        return [
          {
            icons: value.slice(0, 3),
          },
          {
            icons: value.slice(3),
          },
        ]
      } else return value
    })

    return { icons }
  },
})
</script>

<template>
  <section class="mb-80 lg:mb-160 grid justify-center text-center">
    <div class="max-w-[274px] lg:max-w-[initial]">
      <h2
        class="font-sf-pro-display leading-[28px] lg:leading-[32px] text-[22px] lg:text-[32px] font-semibold mb-16"
      >
        Works with your favorite tools
      </h2>

      <p class="mb-48 text-display-small-sm lg:text-display-small">
        Test your product prototypes from your favorite design tools
      </p>
    </div>

    <div
      class="grid gap-y-30 lg:gap-y-0 lg:flex lg:space-x-30 w-fit mx-auto justify-center"
    >
      <template v-for="(item, i) in icons">
        <template v-if="$breakpoint.isMobile">
          <div :key="`${i}`" class="flex items-center space-x-30">
            <div
              v-for="(icon, iconIndex) in item.icons"
              :key="`${i}-${iconIndex}`"
              class="h-50 w-fit"
            >
              <Tooltip v-slot="{ events }" :label="icon.label" open-delay="500">
                <span v-on="events">
                  <Component :is="icon.title" />
                </span>
              </Tooltip>
            </div>
          </div>
        </template>

        <div v-else :key="`${i}-desktop`" class="h-50 w-fit">
          <Tooltip v-slot="{ events }" :label="item.label" open-delay="500">
            <span v-on="events">
              <Component :is="item.title" />
            </span>
          </Tooltip>
        </div>
      </template>
    </div>
  </section>
</template>
