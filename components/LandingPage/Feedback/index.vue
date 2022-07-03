<template>
  <section class="mb-85 md:mb-100">
    <h2
      class="font-sf-pro-display text-[18px] md:text-[26px] leading-[32px] text-text-subdued text-center px-8"
    >
      What our users are saying:
    </h2>

    <div
      class="relative before:absolute before:left-0 before:w-14 md:before:w-219 before:h-full before:bg-surface-default/70 before:z-1 w-full md:w-fit mx-auto after:absolute after:right-0 after:w-14 md:after:w-219 after:h-full after:bg-surface-default/70 after:z-1 pointer-events-none before:top-0 after:top-0"
    >
      <ul
        class="h-fit flex overflow-x-auto space-x-14 md:space-x-20 py-26 w-[min(100%,600px)] md:w-[933px] mx-auto snap-x snap-mandatory hide-scrollbar px-20 pointer-events-auto"
      >
        <li aria-hidden="true" class="min-w-full md:min-w-[493px] h-full" />

        <li
          v-for="i in 4"
          :key="i"
          class="bg-surface-default shadow-2 h-full w-full md:w-493 rounded-r-[8px] shrink-0 p-14 md:p-20 snap-center"
        >
          <h3
            class="text-[11.52px] md:text-[16px] leading-[17.27px] md:leading-[24px] font-semibold mb-14 md:mb-20"
          >
            “Crowd saved us a ton of money”
          </h3>

          <p
            class="text-[10.08px] md:text-[14px] leading-[14.39px] md:leading-[20px] mb-16 md:mb-20 h-72 md:h-80 line-clamp-4"
          >
            Building a product is never easy, we have run various tests to
            ensure a product market fit. The prototype evaluation test was our
            go-to for our user testing. Crowd saved us a ton of money by
            allowing us quickly test our prototypes before going live.
          </p>

          <div class="flex space-x-[12.5px] md:space-x-16">
            <Img
              src="static/png/landing-page/feedback/avatar"
              alt="pretty smiling joyfully personl ooking with satisfaction"
              :width="$breakpoint.isMobile ? 43.18 : 60"
              :height="$breakpoint.isMobile ? 43.18 : 60"
              class="rounded-full w-[43.18px] md:w-60 h-[43.18px] md:h-60 bg-[#E1EDFB]"
            />

            <div class="mt-4">
              <h4
                class="text-[11.52px] md:text-[16px] leading-[17.27px] md:leading-[24px] font-semibold"
              >
                Sophia Moore
              </h4>

              <h5
                class="text-[8.64px] md:text-[12px] leading-[11.52px] md:leading-[16px] font-semibold text-text-subdued"
              >
                CEO at Webflow Agency
              </h5>
            </div>
          </div>
        </li>

        <li aria-hidden="true" class="min-w-full md:min-w-[493px] h-full" />
      </ul>
    </div>
  </section>
</template>

<script lang="ts">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
} from '@vue/composition-api'

export default defineComponent({
  name: 'LandingPageFeedback',
  components: {},
  setup(_, { root: { $breakpoint } }) {
    onMounted(() => {
      if (!$breakpoint.isMobile) {
        const root = getCurrentInstance()?.vnode.elm

        if (root instanceof HTMLElement) {
          const ul = root.querySelector('ul') as HTMLElement

          // get the first li's width
          const firstListItemWidth =
            ul.querySelector('li:not([aria-hidden])')?.clientWidth || 0

          if (ul) {
            ul.scrollTo({
              left: firstListItemWidth,
            })
          }
        }
      }
    })
  },
})
</script>

<style scoped lang="postcss"></style>
