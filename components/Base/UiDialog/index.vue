<script lang="ts">
import {
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  ref,
  watch,
} from '@vue/composition-api'
import TrapFocus from 'ui-trap-focus'
import Button from '../Button/index.vue'
import Tooltip from '../Tooltip/index.vue'

import FadeTransition from '../FadeTransition/index.vue'
import { uid } from '~/utils'

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
    contentStyle: {
      type: [String, Object],
      default: undefined,
    },
    contentClass: {
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
  },

  setup(_props, { emit, slots, root }) {
    const id = ref(uid())

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

    const cleanup = () => {
      root.$store.commit('app/removeFromDialogs', id.value)
    }

    watch(
      () => root.$route.fullPath,
      () => {
        modelSync.value = false
      }
    )

    watch(
      () => modelSync.value,
      (val) => {
        if (val) {
          root.$store.commit('app/addToDialogs', id.value)
        } else {
          cleanup()
        }
      }
    )

    const previousActive = ref<HTMLElement | null>(null)

    const trapFocus = (evt: KeyboardEvent) => {
      if (isFurthestDialog.value) {
        new TrapFocus({
          loop: true,
        }).init(evt)
      }

      emit('keydown', evt)
    }

    const beforeEnter = () => {
      previousActive.value = document.activeElement as HTMLElement
    }

    const enter = (el: HTMLElement) => {
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

    const afterLeave = () => {
      const validPreviousActive =
        previousActive.value instanceof HTMLElement &&
        document.contains(previousActive.value)

      if (previousActive.value && validPreviousActive) {
        previousActive.value.focus()
      }
    }

    const canShowFooter = computed(
      () => _props.showFooter && slots.footer?.() && slots.footer?.().length
    )

    const closeDialog = () => {
      if (_props.isAlert) {
        if (contentRef.value) {
          contentRef.value.focus()
        }
      } else {
        modelSync.value = false
      }
    }

    onBeforeUnmount(cleanup)

    return {
      enter,
      trapFocus,
      beforeEnter,
      afterLeave,
      closeDialog,
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
        :class="{
          'p-20': !fullScreen,
          'flex-centered': centered,
          'bg-black/50': !hideBackdrop,
          'pointer-events-none': hideBackdrop,
        }"
        :style="{
          'z-index': `${(indexInDialogs || 1) + 100}`,
        }"
        @wheel.prevent
        @click="closeDialog"
      >
        <template v-if="!plain">
          <slot name="prefix" />

          <!-- content -->
          <Transition>
            <div
              v-if="modelSync"
              ref="contentRef"
              v-bind="contentAttrs"
              :tabindex="modelSync ? '0' : undefined"
              class="content"
              :class="[
                transition,
                contentClass,
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
              @keydown.esc="!isAlert && (modelSync = false)"
              @wheel.stop
              @click.stop
            >
              <!-- content header -->
              <div v-if="showHeader" class="header">
                <p
                  class="flex-grow text-display-small-sm md:text-display-small"
                >
                  <slot name="header">
                    {{ title }}
                  </slot>
                </p>

                <Tooltip
                  v-if="!isAlert"
                  v-slot="{ events }"
                  label="Close"
                  placement="right"
                >
                  <Button
                    plain
                    aria-label="Close"
                    icon="MobileCancelMajor"
                    class="fill-icon-default w-16 h-16 shrink-0"
                    @click="modelSync = false"
                    v-on="events"
                  />
                </Tooltip>
              </div>

              <!-- content body -->
              <div
                class="body"
                :class="{
                  'show-header': showHeader,
                  'show-footer': canShowFooter,
                  'p-20': !noBodyPadding,
                }"
              >
                <slot />
              </div>

              <!-- content footer -->
              <div v-if="canShowFooter" class="footer">
                <slot name="footer" />
              </div>
            </div>
          </Transition>

          <slot name="suffix" />
        </template>

        <slot v-else />
      </div>
    </FadeTransition>
  </Teleport>
</template>

<style scoped lang="postcss">
.UiDialog {
  @apply fixed inset-0 w-full h-full touch-none;
  --fade-enter-duration: 250ms;
}

.fade-transition-enter-active .content,
.fade-transition-leave-active .content {
  @apply transition-transform duration-[inherit];
}

.fade-transition-enter-active .content {
  transition-timing-function: var(--ease-back-out);
}

.fade-transition-enter .content.scale {
  @apply scale-[1.05];
}

.fade-transition-enter .content.content.scale,
.fade-transition-leave-to .content.content.scale {
  @apply scale-[0.95];
}

.fade-transition-enter-active .content.content.slide-y {
  transition-timing-function: cubic-bezier(0, 0.55, 0.45, 1);
  transition-duration: 350ms;
}

.fade-transition-enter .content.slide-y {
  @apply translate-y-[-4rem];
}

.fade-transition-enter .content.slide-y,
.fade-transition-leave-to .content.slide-y {
  @apply translate-y-[-4rem];
}

.content {
  @apply rounded-lg bg-surface-default shadow-5 z-1 relative outline-none max-h-full grid touch-auto overflow-hidden;
}

.header {
  @apply h-68 p-20 pr-12 flex items-center justify-between min-w-[240px] space-x-12 shadow-divide-bottom;
}

.body {
  @apply overflow-y-auto max-h-full overscroll-contain;
}

.footer {
  box-shadow: inset 0px 1px 0px #e4e5e7;
  @apply h-70 p-16 flex items-center justify-end min-w-[240px];
}
</style>
