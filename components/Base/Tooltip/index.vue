<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from '@vue/composition-api'
import { createPopper } from '@popperjs/core'
import type { Instance as PopperInstance, Placement } from '@popperjs/core'
import FadeTransition from '../FadeTransition/index.vue'
import { oneFrame, sleep, uid } from '~/utils'
import type { Duration, LikeNumber } from '~/types'

export interface TooltipPayload {
  toggle: (val?: boolean) => void
  open: () => void
  close: () => void
  active: boolean
}

export default defineComponent({
  name: 'BaseTooltip',
  components: { FadeTransition },
  model: {
    event: 'update:modelValue',
    prop: 'modelValue',
  },
  props: {
    closeDelay: {
      type: [String, Number] as unknown as () => LikeNumber,
      default: 0,
    },
    openDelay: {
      type: [String, Number] as unknown as () => LikeNumber,
      default: 300,
    },
    label: {
      type: String,
      default: undefined,
    },
    modelValue: {
      type: Boolean,
      default: undefined,
    },
    show: {
      type: Boolean,
      default: undefined,
    },
    leaveDuration: {
      type: String as () => Duration,
      default: '200ms',
    },
    enterDuration: {
      type: String as () => Duration,
      default: '200ms',
    },
    offset: {
      type: Array as unknown as () => [number, number],
      default: () => [0, 8],
    },
    placement: {
      type: String as () => Placement,
      default: 'bottom',
    },
    disabled: Boolean,
    invert: Boolean,
    triggerClass: {
      type: String,
      default: undefined,
    },
  },
  emits: ['update:modelValue'],
  setup(_props, { emit, root }) {
    const contentRef = ref<HTMLElement | null>(null)

    const triggerRef = ref<HTMLElement | null>(null)

    const id = ref(uid('tooltip-'))

    const props = computed(() => _props)

    const dialogs = computed(() => root.$store.state.app.dialogs as string[])

    const popperInstance = ref<PopperInstance | null>(null)

    const indexInDialogs = computed(() => {
      return dialogs.value.indexOf(id.value)
    })

    const isFurthestDialog = computed(
      () => indexInDialogs.value === dialogs.value.length - 1
    )

    const manualModel = ref(props.value.show)

    const toggleModel = (val: boolean) => {
      if (typeof _props.modelValue === 'boolean') {
        emit('update:modelValue', val)
      }

      manualModel.value = val
    }

    const modelSync = computed({
      get() {
        if (typeof _props.modelValue === 'boolean') {
          return _props.modelValue
        }

        return manualModel.value
      },
      set(val: boolean) {
        if (typeof val === 'boolean' && !props.value.disabled) {
          toggleModel(val)
        }
      },
    })

    watch(
      () => props.value.disabled,
      (newVal) => {
        if (newVal) {
          toggleModel(false)
        }
      }
    )

    const contentEntered = ref(modelSync.value)

    const positionPopper = () => {
      popperInstance.value?.destroy()

      if (
        triggerRef.value &&
        contentRef.value &&
        document.contains(triggerRef.value) &&
        modelSync.value
      ) {
        popperInstance.value = createPopper(
          triggerRef.value,
          contentRef.value,
          {
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: _props.offset,
                },
              },

              {
                name: 'preventOverflow',
                options: {
                  mainAxis: false,
                },
              },
            ],
            placement: _props.placement,
          }
        )
      }
    }

    const toggle = async (val?: boolean) => {
      const value = typeof val === 'boolean' ? val : !modelSync.value

      modelSync.value = value

      await sleep(oneFrame * 2)

      if (contentRef.value && triggerRef.value && value) {
        positionPopper()

        // to fix a bug where the popper element shifts after entering
        positionPopper()
      }
    }

    const delayedToggle = (callback: Function, delay: LikeNumber) => {
      if (timeout.value) {
        clearTimeout(timeout.value)
      }

      timeout.value = setTimeout(() => {
        callback()

        timeout.value && clearTimeout(timeout.value)

        timeout.value = null
      }, Number(delay)) as unknown as NodeJS.Timeout
    }

    const open = () => delayedToggle(() => toggle(true), props.value.openDelay)

    const close = () =>
      delayedToggle(() => toggle(false), props.value.closeDelay)

    const timeout = ref<NodeJS.Timeout | null>(null)

    const payload = computed<TooltipPayload>(() => ({
      toggle,
      open,
      close,
      active: modelSync.value,
      events: {
        mouseenter: open,
        mouseleave: close,
        focus: open,
        blur: close,
        click: close,
      },
    }))

    const watchProps = computed(() => {
      const { offset } = _props

      return JSON.stringify({
        offset,
      })
    })

    const toggleStoreDialogState = (action: 'add' | 'remove' = 'remove') => {
      root.$store.commit(
        `app/${action === 'add' ? 'addToDialogs' : 'removeFromDialogs'}`,
        id.value
      )

      if (action === 'remove') {
        popperInstance.value?.destroy()
      }
    }

    watch(
      () => isFurthestDialog.value,
      (val) => {
        if (!val && modelSync.value) {
          toggle(false)
        }
      }
    )

    const onBeforeEnter = () => {
      toggleStoreDialogState('add')

      contentEntered.value = false
    }

    const onAfterEnter = () => {
      contentEntered.value = true
    }

    const onLeave = () => {
      contentEntered.value = false
    }

    const onAfterLeave = () => {
      toggleStoreDialogState()

      popperInstance.value?.destroy()

      contentEntered.value = false
    }

    watch(() => watchProps.value, positionPopper)

    onMounted(positionPopper)

    onBeforeUnmount(toggleStoreDialogState)

    return {
      id,
      contentRef,
      triggerRef,
      payload,
      modelSync,
      indexInDialogs,
      onBeforeEnter,
      onAfterLeave,
      open,
      close,
      toggle,
      onLeave,
      onAfterEnter,
    }
  },
})
</script>

<template>
  <div :id="id">
    <div
      ref="triggerRef"
      :title="modelSync ? '' : undefined"
      class="w-full h-full"
      :class="triggerClass"
    >
      <slot v-bind="payload" />
    </div>

    <Teleport to="overlay">
      <FadeTransition
        @before-enter="onBeforeEnter"
        @leave="onLeave"
        @after-enter="onAfterEnter"
        @after-leave="onAfterLeave"
      >
        <div
          v-if="modelSync"
          ref="contentRef"
          :style="{
            'z-index': `${(indexInDialogs || 1) + 1000}`,
            '--fade-enter-duration': enterDuration,
            '--fade-leave-duration': leaveDuration,
          }"
          class="content text-sub-heading px-8 py-4 rounded pointer-events-none"
          :class="{
            'bg-base-on-surface text-base-surface': !invert,
            'bg-surface-default': invert,
          }"
        >
          <div data-popper-arrow class="arrow" />
          <slot name="content" v-bind="payload">
            {{ label }}
          </slot>
        </div>
      </FadeTransition>
    </Teleport>
  </div>
</template>

<style scoped>
.arrow,
.arrow::before {
  --size: 6px;
  position: absolute;
  width: var(--size);
  height: var(--size);
  background: inherit;
  --arrow-offset: calc(0px - calc(var(--size) / 2));
  pointer-events: none;
}

.arrow {
  visibility: hidden;
}

.arrow::before {
  visibility: visible;
  content: '';
  transform: rotate(45deg);
  border-top-left-radius: calc(var(--size) * 0.25);
}

.content[data-popper-placement^='top'] .arrow {
  bottom: var(--arrow-offset);
}

.content[data-popper-placement^='bottom'] .arrow {
  top: var(--arrow-offset);
}

.content[data-popper-placement^='left'] .arrow {
  right: var(--arrow-offset);
}

.content[data-popper-placement^='right'] .arrow {
  left: var(--arrow-offset);
}
</style>
