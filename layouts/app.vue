<script lang="ts">
import {
  computed,
  defineComponent,
  ref,
  watch,
  nextTick,
} from '@vue/composition-api'
import Header from '~/components/App/Header/index.vue'
import Navigation from '~/components/App/Drawer/Navigation/index.vue'
import PageHeader from '~/components/App/PageHeader/index.vue'
import SmallDevice from '~/components/App/SmallDevice/index.vue'
import { isLoggedInMiddleware } from '~/utils/layout'
import layouts from '~/mixins/layouts'
import { RouteDialog, VueElement } from '~/types'
import AlertDialog from '~/components/Base/AlertDialog/index.vue'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'
import { RootState } from '~/store'
import FeedbackForm from '~/components/Base/RouteDialog/FeedbackForm/index.vue'
import DelayMount from '~/components/Base/DelayMount/index.vue'
import { sleep, validRouteDialog } from '~/utils'
// import LoadingBar from '~/components/Base/LoadingBar/index.vue'

export default defineComponent({
  name: 'AppLayout',
  components: {
    SmallDevice,
    Header,
    Navigation,
    PageHeader,
    AlertDialog,
    FadeTransition,
    FeedbackForm,
    DelayMount,
  },
  mixins: [layouts],
  middleware: isLoggedInMiddleware,
  setup(_, { root }) {
    const main = ref<HTMLElement>(null)

    const dialogs = computed(
      () => root.$store.getters['app/nonTooltips'] as string[]
    )

    const tooltips = computed(
      () => root.$store.getters['app/tooltips'] as string[]
    )

    const transitionClasses = computed(() => {
      const activeClass =
        'transform-gpu transition-[transform,opacity] duration-[200ms] ease-spring'

      const genericClass = {
        enterActiveClass: activeClass,
        leaveActiveClass: activeClass,
        leaveToClass: 'opacity-0',
      }

      if (root.$breakpoint.isMobile) {
        return {
          enterClass: 'opacity-0 translate-y-[-20px] transform-gpu',
          ...genericClass,
        }
      } else {
        return {
          enterClass: 'opacity-0 translate-y-[20px] transform-gpu',
          ...genericClass,
        }
      }
    })

    const creatingTest = computed(() => {
      return (
        (root.$store.state as RootState).projectSuite.create.submitting &&
        root.$route.name === 'dashboard-project-:id'
      )
    })

    // scroll main element to top
    watch(
      () => root.$route.fullPath,
      async (nv, ov) => {
        const getRouteDialog = (path: string) => {
          const match = path.match(/\??dialog=.+/g)

          if (match) {
            const queries = match[0].split('&')

            if (queries) {
              const dialogQueries = queries.filter((x) => /^\??dialog/.test(x))

              if (dialogQueries) {
                const dialogQueryValue = (dialogQueries[0].split('=') || [])[1]

                if (dialogQueryValue) {
                  return dialogQueryValue as RouteDialog
                }
              }
            }
          }
          return '' as RouteDialog
        }

        if (
          validRouteDialog.includes(getRouteDialog(nv)) ||
          validRouteDialog.includes(getRouteDialog(ov))
        ) {
          return
        }

        await nextTick()

        if (main.value) {
          const afterPageTransition = async (extra: number = 0) => {
            // Dont change this without changing the .page-transition-*-leave-active duration in /assets/css/utilities.css
            await sleep(100 + extra)
          }

          const viewResultRegExp = /project\/view-result/

          if (viewResultRegExp.test(ov) && viewResultRegExp.test(nv)) {
            return
          }

          await afterPageTransition()

          const el = main.value

          el.scrollTo(0, 0)
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

    return {
      main,
      dialogs,
      tooltips,
      transitionClasses,
      creatingTest,
      closeAllTooltips,
    }
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
    :key="$store.state.app.globalKey"
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
      <SmallDevice v-if="$breakpoint.isMobile && !$appState.allowMobileView" />

      <FadeTransition v-else :duration="{ leave: 100 }">
        <div
          :key="$user.onboarded"
          role="document"
          class="bg-surface-default grid grid-rows-[56px,1fr] grid-cols-[auto,1fr] min-h-screen min-w-screen h-screen w-screen overflow-hidden max-h-screen"
        >
          <Header />

          <template v-if="$user.onboarded">
            <Navigation />
            <main
              ref="main"
              class="col-start-2 row-start-2 h-full w-full max-h-full overflow-x-hidden bg-surface-neutral-disabled isolate overscroll-contain windows-os-self:lock-html-scroll:pr-4 relative"
              :class="
                $appState.os === 'mac'
                  ? {
                      'overflow-y-auto': !dialogs.length,
                      'overflow-hidden': dialogs.length,
                    }
                  : undefined
              "
            >
              <!-- <LoadingBar
                :state="creatingTest ? 'start' : 'finish'"
                class="!left-[auto] !top-[auto] !w-[calc(100%-var(--sidebar-width))]"
              /> -->

              <PageHeader />

              <NuxtChild :inert="creatingTest || undefined" />
            </main>
          </template>

          <NuxtChild v-else />
        </div>
      </FadeTransition>
    </Transition>

    <AlertDialog
      :model-value="$alert.active"
      :title="$alert.title"
      :subtitle="$alert.subtitle"
      :actions="$alert.actions"
      @update:modelValue="(val) => ($alert.active = val)"
    />

    <DelayMount>
      <FeedbackForm />
    </DelayMount>
  </div>
</template>
