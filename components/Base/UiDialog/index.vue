<script lang="ts">
import {
  computed,
  defineComponent,
  nextTick,
  onBeforeMount,
  onBeforeUnmount,
  ref,
  watch,
} from '@vue/composition-api'
import TrapFocus from 'ui-trap-focus'
import Button from '../Button/index.vue'
import Tooltip from '../Tooltip/index.vue'

import FadeTransition from '../FadeTransition/index.vue'
import { uid } from '~/utils'
import eventKey from '~/utils/eventKey'

export type DrawerFrom = 'top' | 'right' | 'bottom' | 'left'

export default defineComponent({
  name: 'BaseDialog',
  components: { FadeTransition, Button, Tooltip },
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  props: {
    noBodyPadding: Boolean,
    plain: Boolean,
    to: {
      type: String,
      default: 'overlay',
    },
    title: {
      type: String,
      default: undefined,
    },
    fullScreen: Boolean,
    centered: {
      type: Boolean,
      default: true,
    },
    showHeader: {
      type: Boolean,
      default: true,
    },
    showFooter: {
      type: Boolean,
      default: true,
    },
    contentAttrs: {
      type: Object,
      default: () => ({}),
    },
    contentEvents: {
      type: Object,
      default: () => ({}),
    },
    rootClass: {
      type: [String, Object],
      default: undefined,
    },
    contentStyle: {
      type: [String, Object],
      default: undefined,
    },
    contentClass: {
      type: [String, Object, Array],
      default: undefined,
    },
    bodyClass: {
      type: [String, Object, Array],
      default: undefined,
    },
    modelValue: Boolean,
    hideBackdrop: Boolean,
    isAlert: Boolean,
    transition: {
      type: String as () => 'scale' | 'slide-y',
      default: 'scale',
    },
    asDrawer: {
      type: Boolean,
      default: false,
    },
    from: {
      type: String as () => DrawerFrom,
      default: 'right',
    },
    leaveFocus: {
      type: String,
      default: undefined,
    },
  },
  emits: ['on-close'],
  setup(_props, { emit, slots, root }) {
    const id = ref(uid('dialog-'))

    const contentRef = ref<HTMLElement | null>(null)

    const modelSync = computed({
      get() {
        return _props.modelValue
      },
      set(val: boolean) {
        if (typeof val === 'boolean') {
          emit('update:modelValue', val)
        }
      },
    })

    const dialogs = computed(() => root.$store.state.app.dialogs as string[])

    const indexInDialogs = computed(() => {
      return dialogs.value.indexOf(id.value)
    })

    const isFurthestDialog = computed(
      () => indexInDialogs.value === dialogs.value.length - 1
    )

    const previousActive = ref<HTMLElement | null>(null)

    const trapFocus = (evt: KeyboardEvent) => {
      if (isFurthestDialog.value && eventKey(evt) === 'tab') {
        new TrapFocus({
          loop: true,
        }).init(evt)
      }

      emit('keydown', evt)
    }

    const beforeEnter = (el: HTMLElement) => {
      emit('beforeEnter', el)
      previousActive.value = document.activeElement as HTMLElement
    }

    const enter = (el: HTMLElement) => {
      emit('enter', el)

      nextTick(() => {
        if (el) {
          // check to see that the active element isn't inside current dialog
          const activeElement = document.activeElement

          const closestDialogEl = activeElement?.closest('.UiDialog')

          if (!closestDialogEl?.isSameNode(el)) {
            const content = el.querySelector('.content') as HTMLElement

            if (content) {
              content.focus()
            }
          }
        }
      })
    }

    const afterLeave = async (el: HTMLElement) => {
      emit('afterLeave', el)

      if (_props.leaveFocus) {
        const leaveFocus = document.querySelector(
          _props.leaveFocus
        ) as HTMLElement

        if (leaveFocus) {
          previousActive.value = leaveFocus

          await nextTick()
        }
      }

      const validPreviousActive =
        previousActive.value instanceof HTMLElement &&
        document.contains(previousActive.value)

      if (validPreviousActive) {
        previousActive.value.focus()
      }
    }

    const closeDialog = () => {
      if (!modelSync.value) {
        return
      }

      if (_props.isAlert) {
        if (contentRef.value) {
          contentRef.value.focus()
        }
      } else {
        modelSync.value = false

        emit('on-close')
      }
    }

    const toggle = (val?: boolean) => {
      const active = typeof val === 'boolean' ? val : !modelSync

      if (active) {
        modelSync.value = true
      } else {
        closeDialog()
      }
    }

    const payload = computed(() => {
      return {
        close: closeDialog,
        toggle,
        open: () => toggle(true),
        active: modelSync.value,
      }
    })

    const canShowFooter = computed(
      () =>
        _props.showFooter &&
        slots.footer?.(payload.value) &&
        slots.footer?.(payload.value).length
    )

    const cleanup = () => {
      root.$store.commit('app/removeFromDialogs', id.value)

      // closeDialog()
    }

    watch(
      () => root.$route.path,
      () => {
        if (modelSync.value) {
          cleanup()
        }
      }
    )

    watch(
      () => modelSync.value,
      (val) => {
        if (val) {
          root.$store.commit('app/addToDialogs', id.value)
        } else {
          root.$store.commit('app/removeFromDialogs', id.value)
        }
      }
    )

    onBeforeMount(() => {
      if (modelSync.value) {
        root.$store.commit('app/addToDialogs', id.value)
      }
    })

    onBeforeUnmount(cleanup)

    return {
      enter,
      trapFocus,
      beforeEnter,
      afterLeave,
      closeDialog,
      payload,
      canShowFooter,
      modelSync,
      indexInDialogs,
      contentRef,
    }
  },
})
</script>

<template>
  <Teleport :to="to">
    <FadeTransition
      @before-enter="beforeEnter"
      @enter="enter"
      @after-leave="afterLeave"
    >
      <div
        v-show="modelSync"
        v-bind="$attrs"
        class="UiDialog"
        :class="[
          asDrawer
            ? [
                'p-8 as-drawer',
                {
                  'justify-end': from === 'right',
                },
              ]
            : {
                'p-20': !fullScreen,
                'flex-centered': centered,
              },
          {
            'bg-black/50': !hideBackdrop,
            'pointer-events-none': hideBackdrop,
          },
          rootClass,
        ]"
        :style="{
          'z-index': `${(indexInDialogs || 1) + 100}`,
        }"
        @wheel.prevent
        @click="closeDialog"
      >
        <template v-if="!plain">
          <slot name="prefix" v-bind="payload" />

          <!-- content -->
          <Transition>
            <div
              v-if="modelSync"
              ref="contentRef"
              v-bind="contentAttrs"
              :tabindex="modelSync ? '0' : undefined"
              class="content"
              :class="[
                contentClass,
                asDrawer ? [`slide-from-${from} as-drawer`] : [transition],
                {
                  'grid-rows-[68px,calc(100%-68px)]':
                    showHeader && !canShowFooter,
                  'grid-rows-[calc(100%-70px),70px]':
                    canShowFooter && !showHeader,
                  'grid-rows-[68px,calc(100%-68px-70px),70px]':
                    canShowFooter && showHeader,
                  'pointer-events-auto': hideBackdrop,
                },
              ]"
              :style="contentStyle"
              v-on="{
                ...contentEvents,
                ...(modelSync
                  ? {
                      keydown: trapFocus,
                    }
                  : {}),
              }"
              @keydown.esc="
                () => {
                  !isAlert && closeDialog()
                }
              "
              @wheel.stop
              @click.stop
            >
              <!-- content header -->
              <div v-if="showHeader" class="header">
                <p
                  class="flex-grow text-display-small-sm md:text-display-small font-sf-pro-display"
                >
                  <slot name="header" v-bind="payload">
                    {{ title }}
                  </slot>
                </p>

                <Tooltip
                  v-if="!isAlert"
                  v-slot="{ events }"
                  label="Close"
                  placement="right"
                  open-delay="500"
                >
                  <Button
                    plain
                    aria-label="Close"
                    icon="MobileCancelMajor"
                    class="fill-icon-default w-16 h-16 shrink-0"
                    @click="closeDialog"
                    v-on="events"
                  />
                </Tooltip>
              </div>

              <!-- content body -->
              <div
                class="body"
                :class="[
                  {
                    'show-header': showHeader,
                    'show-footer': canShowFooter,
                    'p-20': !noBodyPadding,
                  },
                  bodyClass,
                ]"
              >
                <slot v-bind="payload" />
              </div>

              <!-- content footer -->
              <div v-if="canShowFooter" class="footer">
                <slot name="footer" v-bind="payload" />
              </div>
            </div>
          </Transition>

          <slot name="suffix" v-bind="payload" />
        </template>

        <slot v-else v-bind="payload" />
      </div>
    </FadeTransition>
  </Teleport>
</template>

<style scoped lang="postcss">
.UiDialog {
  @apply fixed inset-0 w-full h-full touch-none flex;
  --fade-enter-duration: 250ms;
}

.UiDialog.as-drawer {
  --fade-enter-duration: 350ms;
}

.fade-transition-enter .content,
.fade-transition-leave .content,
.fade-transition-enter-active .content,
.fade-transition-leave-active .content {
  will-change: transform;
}

.fade-transition-enter-active .content,
.fade-transition-leave-active .content {
  @apply transition-[transform,opacity] duration-[inherit];
}

.fade-transition-enter-active .content {
  transition-timing-function: var(--ease-back-out);
}

.fade-transition-enter .content.scale {
  @apply scale-[1.05];
}

.fade-transition-enter .content.content.scale,
.fade-transition-leave-to .content.content.scale {
  @apply scale-[0.9];
}

.fade-transition-enter-active .content.content.slide-y,
.fade-transition-enter-active .content.content.slide-y-reverse {
  transition-timing-function: cubic-bezier(0, 0.15, 0.45, 1);
}

.fade-transition-enter .content.slide-y {
  @apply translate-y-[-4rem];
}

.fade-transition-enter .content.slide-y,
.fade-transition-leave-to .content.slide-y {
  @apply translate-y-[-4rem];
}

.fade-transition-enter .content.slide-y-reverse {
  @apply translate-y-[4rem];
}

.fade-transition-enter .content.slide-y-reverse,
.fade-transition-leave-to .content.slide-y-reverse {
  @apply translate-y-[4rem];
}

.fade-transition-enter-active .content.as-drawer {
  transition-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.05);
  transition-duration: inherit;
}

.fade-transition-enter .content.slide-from-right {
  @apply translate-x-[90%];
}

.fade-transition-leave-to .content.slide-from-right {
  @apply translate-x-[40%];
}

.fade-transition-enter .content.slide-from-bottom {
  @apply translate-y-[90%];
}

.fade-transition-leave-to .content.slide-from-bottom {
  @apply translate-y-[40%];
}

.content {
  @apply bg-surface-default shadow-5 z-1 relative outline-none max-h-full grid touch-auto overflow-hidden rounded-lg;
}

.header {
  @apply h-68 p-20 pr-16 flex items-center justify-between min-w-[240px] space-x-12 shadow-divide-bottom;
}

.body {
  @apply overflow-y-auto max-h-full overscroll-contain;
}

.footer {
  box-shadow: inset 0px 1px 0px #e4e5e7;
  @apply h-70 p-16 flex items-center justify-end min-w-[240px];
}
</style>
