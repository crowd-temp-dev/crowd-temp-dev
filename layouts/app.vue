<script lang="ts">
import { computed, defineComponent, ref, watch } from '@vue/composition-api'
import Header from '~/components/App/Header/index.vue'
import Navigation from '~/components/App/Drawer/Navigation/index.vue'
import PageHeader from '~/components/App/PageHeader/index.vue'
import SmallDevice from '~/components/App/SmallDevice/index.vue'
import { isLoggedInMiddleware } from '~/utils/layout'
import layouts from '~/mixins/layouts'
import { VueElement } from '~/types'
import AlertDialog from '~/components/Base/AlertDialog/index.vue'

export default defineComponent({
  name: 'AppLayout',
  components: { SmallDevice, Header, Navigation, PageHeader, AlertDialog },
  mixins: [layouts],
  middleware: isLoggedInMiddleware,
  setup(_, { root }) {
    const main = ref(null)

    const dialogs = computed(
      () => root.$store.getters['app/nonTooltips'] as string[]
    )

    const tooltips = computed(
      () => root.$store.getters['app/tooltips'] as string[]
    )

    const transitionClasses = computed(() => {
      const activeClass = 'transition-[transform,opacity] duration-[200ms] ease-spring'

      const genericClass = {
        enterActiveClass: activeClass,
        leaveActiveClass: activeClass,
        leaveToClass: 'opacity-0',
      }

      if (root.$breakpoint.isMobile) {
        return {
          enterClass: 'opacity-0 translate-y-[-20px]',
          ...genericClass,
        }
      } else {
        return {
          enterClass: 'opacity-0 translate-y-[20px]',
          ...genericClass,
        }
      }
    })

    // scroll main element to top
    watch(
      () => root.$route.fullPath,
      () => {
        if (main.value) {
          const timeout = setTimeout(
            () => {
              const el = main.value as unknown as HTMLElement
              el.scrollTo(0, 0)

              clearTimeout(timeout)
            },
            // Dont change this without changing the .page-transition-*-leave-active duration in /assets/css/utilities.css
            100
          )
        }
      }
    )

    const closeAllTooltips = () => {
      const activeTooltips = tooltips.value

      if (activeTooltips.length) {
        activeTooltips.forEach((id) => {
          const tooltipRoot = document.getElementById(id) as VueElement

          if (tooltipRoot) {
            tooltipRoot.__vue__.close()
          }
        })
      }
    }

    return { main, dialogs, tooltips, closeAllTooltips, transitionClasses }
  },

  head() {
    const overlayActive = (this.$store.state.app.dialogs as string[]).length

    const attrs = {
      'data-lock-html-scroll': '',
    } as Record<string, any>

    if (overlayActive) {
      attrs['data-overlay-active'] = ''
    }

    return {
      htmlAttrs: attrs,
    }
  },
})
</script>

<template>
  <div
    :class="{ 'hide-ui': !mounted }"
    v-on="
      tooltips.length
        ? {
            wheel: closeAllTooltips,
            scroll: closeAllTooltips,
          }
        : {}
    "
  >
    <Transition mode="out-in" v-bind="transitionClasses">
      <!-- Layout for clients signed in -->
      <SmallDevice v-if="$breakpoint.isMobile" />

      <div
        v-else
        role="document"
        class="bg-surface-default grid grid-rows-[56px,1fr] grid-cols-[auto,1fr] min-h-screen min-w-screen h-screen w-screen transform-gpu overflow-hidden"
      >
        <Header />

        <Navigation />

        <main
          ref="main"
          class="col-start-2 row-start-2 h-full w-full max-h-full overflow-x-hidden bg-surface-neutral-disabled isolate overscroll-contain"
          :class="{
            'overflow-y-auto': !dialogs.length,
            'overflow-hidden': dialogs.length,
          }"
        >
          <PageHeader />

          <NuxtChild />
        </main>
      </div>
    </Transition>

    <AlertDialog
      :model-value="$alert.active"
      :title="$alert.title"
      :subtitle="$alert.subtitle"
      :actions="$alert.actions"
      @update:modelValue="(val) => ($alert.active = val)"
    />
  </div>
</template>
