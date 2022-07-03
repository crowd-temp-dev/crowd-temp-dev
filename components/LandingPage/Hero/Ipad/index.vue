<template>
  <div
    class="relative flex justify-center items-center w-[246.12px] h-[168.48px] md:w-[661px] md:h-[452.48px] mx-auto"
  >
    <Img
      src="static/png/landing-page/hero/ipad"
      alt="Ipad image"
      :width="$breakpoint.isMobile ? 246.12 : 661"
      :height="452.48"
      class="w-full h-full"
    />

    <!-- video goes here -->

    <Img
      src="static/png/landing-page/hero/video"
      alt="Onboard video"
      :width="$breakpoint.isMobile ? 223.89 : 601.28"
      :height="$breakpoint.isMobile ? 144.9 : 389.15"
      class="w-[223.89px] md:w-[601.28px] h-[144.9px] md:h-[389.15px] rounded-[5.68px] md:rounded-[15.26px] absolute top-8 md:top-23"
    />

    <!-- <button class="flex items-center justify-center rounded-full cursor-pointer border-none"></button> -->

    <Button
      class="w-[46.15px] h-[46.15px] rounded-full after:rounded-full text-action-primary-default bg-white border-none shadow-none after:shadow-none absolute"
      title="play"
    >
      <PIcon
        source="PlayMinor"
        class="text-[25.84px] ml-4 size-icon fill-icon"
      />
    </Button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import Button from '~/components/Base/Button/index.vue'

export default defineComponent({
  name: 'LandingPageHeroIpad',
  components: { Button },
})
</script>

<style scoped></style>
