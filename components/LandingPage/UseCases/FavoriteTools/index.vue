<script lang="ts">
import { defineComponent } from '@vue/composition-api'

type Icon = 'figma' | 'in-vision' | 'adobe' | 'sketch' | 'marvel'

export default defineComponent({
  name: 'LandinPageUseCasesFavoriteTools',
  setup() {
    const icons: Icon[] = ['figma', 'adobe', 'in-vision', 'sketch', 'marvel']

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
      <li v-for="icon in icons" :key="icon" class="h-50 w-fit">
        <Img :src="`/static/png/icon/${icon}`" :alt="`${icon} icon`" />
      </li>
    </ul>
  </section>
</template>
