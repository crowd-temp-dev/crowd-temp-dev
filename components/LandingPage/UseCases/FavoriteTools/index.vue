<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import Tooltip from '~/components/Base/Tooltip/index.vue'

type Icon = {
  title: 'figma' | 'in-vision' | 'adobe' | 'sketch' | 'marvel'
  label: 'Figma' | 'InVision' | 'Adobe' | 'Sketch' | 'Marvel'
}

export default defineComponent({
  name: 'LandinPageUseCasesFavoriteTools',
  components: { Tooltip },

  setup() {
    const icons: Icon[] = [
      {
        title: 'figma',
        label: 'Figma',
      },
      {
        title: 'adobe',
        label: 'Adobe',
      },
      {
        title: 'in-vision',
        label: 'InVision',
      },
      {
        title: 'sketch',
        label: 'Sketch',
      },
      {
        title: 'marvel',
        label: 'Marvel',
      },
    ]
    return { icons }
  },
})
</script>

<template>
  <section class="mb-160 grid justify-center text-center">
    <h2
      class="font-sf-pro-display leading-[32px] text-[32px] font-semibold mb-16"
    >
      Works with your favorite tools
    </h2>

    <p class="mb-48 text-display-small">
      Test your product prototypes from your favorite design tools
    </p>

    <ul class="flex space-x-30 w-fit mx-auto">
      <li v-for="(item, i) in icons" :key="i" class="h-50 w-fit">
        <Tooltip v-slot="{ events }" :label="item.label" open-delay="500">
          <span v-on="events">
            <Img
              :src="`/static/png/icon/${item.title}`"
              :alt="`${item.title} icon`"
            />
          </span>
        </Tooltip>
      </li>
    </ul>
  </section>
</template>
