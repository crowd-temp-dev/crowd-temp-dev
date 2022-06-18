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
import UiTrapFocus from 'ui-trap-focus'
import type { Instance as PopperInstance, Placement } from '@popperjs/core'
import FadeTransition from '../FadeTransition/index.vue'
import { oneFrame, sleep, uid } from '~/utils'
import eventKey from '~/utils/eventKey'
import type { Duration } from '~/types'

export interface ComboBoxPayload {
  toggle: (val?: boolean) => void
  open: () => void
  close: () => void
  active: boolean
}

export default defineComponent({
  name: 'BaseComboBox',
  components: { FadeTransition },
  model: {
    event: 'update:modelValue',
    prop: 'modelValue',
  },
  props: {
    maxWidth: {
      type: String as () => `${number}${'px' | 'rem' | 'em' | '%'}`,
      default: undefined,
    },
    loopTabbing: {
      type: Boolean,
      default: true,
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
      default: '100ms',
    },
    leaveDelay: {
      type: String as () => Duration,
      default: undefined,
    },
    enterDelay: {
      type: String as () => Duration,
      default: undefined,
    },
    offset: {
      type: Array as unknown as () => [number, number],
      default: () => [0, 12],
    },
    useTriggerWidth: Boolean,
    placement: {
      type: String as () => Placement,
      default: 'bottom',
    },
    restoreFocus: Boolean,
    blockClick: Boolean,
    trapTabFocus: Boolean,
    disabled: Boolean,
    clickOnSpaceKeyPress: {
      type: Boolean,
      default: true,
    },
    triggerRefSelector: {
      type: String,
      default: undefined,
    },
  },
  emits: ['update:modelValue', 'active:true', 'active:false'],
  setup(_props, { emit, root: { $store } }) {
    const contentRef = ref<HTMLElement | null>(null)

    const triggerRef = ref<HTMLElement | null>(null)

    const getTriggerRef = computed<HTMLElement | null>(() => {
      if (_props.triggerRefSelector) {
        const trigger = document.querySelector(
          _props.triggerRefSelector
        ) as HTMLElement

        if (trigger) {
          return trigger
        }
      }

      return triggerRef.value
    })

    const id = ref(uid())

    const props = computed(() => _props)

    const dialogs = computed(() => $store.state.app.dialogs as string[])

    const previousFocus = ref<HTMLElement | null>(null)

    const popperInstance = ref<PopperInstance | null>(null)

    const indexInDialogs = computed(() => {
      return dialogs.value.indexOf(id.value)
    })

    const manualModel = ref(props.value.show)

    const toggleModel = (val: boolean) => {
      if (typeof _props.modelValue === 'boolean') {
        emit('update:modelValue', val)
      }

      manualModel.value = val

      emit(`active:${val}`)
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

    const canNavigate = ref(modelSync.value)

    const contentEntered = ref(modelSync.value)

    const positionPopper = async () => {
      if (
        getTriggerRef.value &&
        contentRef.value &&
        document.contains(getTriggerRef.value) &&
        modelSync.value
      ) {
        popperInstance.value = createPopper(
          getTriggerRef.value,
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

        if (_props.useTriggerWidth) {
          await sleep(oneFrame)

          popperInstance.value?.update()
        }
      }
    }

    const toggle = async (val?: boolean) => {
      const value = typeof val === 'boolean' ? val : !modelSync.value

      modelSync.value = value

      await sleep(oneFrame)

      if (contentRef.value && getTriggerRef.value && value) {
        await positionPopper()

        // to fix a bug where the popper element shifts after entering
        positionPopper()
      }
    }

    const triggerWidth = computed(() => {
      if (popperInstance.value) {
        const popperWidth = `${popperInstance.value.state.rects.reference.width}px`

        return `${Math.min(
          parseFloat(popperWidth),
          parseFloat(props.value.maxWidth || popperWidth)
        )}px`
      }
      return ''
    })

    const open = () => !modelSync.value && toggle(true)

    const close = () => modelSync.value && toggle(false)

    const payload = computed<ComboBoxPayload>(() => ({
      toggle,
      open,
      close,
      active: modelSync.value,
    }))

    const focusTriggerInput = () => {
      if (getTriggerRef.value) {
        const triggerInput = getTriggerRef.value.querySelector('input')

        if (triggerInput) {
          triggerInput.focus()
        }
      }
    }

    const arrowNavigate = (evt: KeyboardEvent) => {
      if (!canNavigate.value) {
        return
      }

      const key = eventKey(evt)

      if (/arrow_down|arrow_up/.test(key) && contentRef.value) {
        evt.preventDefault()

        evt.stopPropagation()

        const _pseudoFocusChildren =
          contentRef.value.querySelectorAll('.pseudo-focus')

        if (_pseudoFocusChildren.length) {
          // get all pseudo-focusable kids
          const pseudoFocusChildren = Array.from(
            _pseudoFocusChildren as NodeListOf<HTMLElement>
          ).filter((node) => !node.dataset.disabled)

          // get current focused kid
          const currentPseudoFocus = pseudoFocusChildren.find(
            (node) => node.dataset.pseudoFocus
          )

          // get current focused kid's index
          const currentPseudoFocusIndex = currentPseudoFocus
            ? pseudoFocusChildren.indexOf(currentPseudoFocus)
            : -1

          let index: number

          if (!(!evt.target && currentPseudoFocusIndex !== -1)) {
            if (key === 'arrow_down') {
              index = currentPseudoFocusIndex + 1

              if (
                (index > pseudoFocusChildren.length - 1 &&
                  props.value.loopTabbing) ||
                !currentPseudoFocus
              ) {
                index = 0
              }
            } else {
              index = currentPseudoFocusIndex - 1

              if (
                (index < 0 && props.value.loopTabbing) ||
                !currentPseudoFocus
              ) {
                index = pseudoFocusChildren.length - 1
              }
            }
          } else {
            index = currentPseudoFocusIndex
          }

          pseudoFocusChildren[index] &&
            requestAnimationFrame(() => {
              // clear all data-pseudo-focus
              for (const node of pseudoFocusChildren) {
                delete node.dataset.pseudoFocus
              }

              pseudoFocusChildren[index].dataset.pseudoFocus = 'true'

              // @ts-ignore
              pseudoFocusChildren[index].scrollIntoViewIfNeeded()
            })
        }
      }
    }

    const clearFocus = () => {
      if (contentRef.value) {
        const pseudoFocusChildren =
          contentRef.value.querySelectorAll('.pseudo-focus')

        if (pseudoFocusChildren) {
          for (const node of Array.from(
            pseudoFocusChildren as NodeListOf<HTMLElement>
          )) {
            delete node.dataset.pseudoFocus
          }
        }
      }
    }

    const clickFocused = () => {
      if (!contentEntered.value || !modelSync.value || !contentRef.value) {
        return
      }

      const currentPseudoFocus = contentRef.value.querySelector(
        '.pseudo-focus[data-pseudo-focus]'
      ) as HTMLElement

      if (currentPseudoFocus) {
        currentPseudoFocus.click()

        requestAnimationFrame(close)
      }
    }

    const watchProps = computed(() => {
      const { offset } = _props

      return JSON.stringify({
        offset,
      })
    })

    const toggleStoreDialogState = (action: 'add' | 'remove' = 'remove') => {
      $store.commit(
        `app/${action === 'add' ? 'addToDialogs' : 'removeFromDialogs'}`,
        id.value
      )

      if (action === 'remove') {
        popperInstance.value?.destroy()
      }
    }

    const onBeforeEnter = () => {
      canNavigate.value = false

      if (props.value.restoreFocus) {
        previousFocus.value = document.activeElement as HTMLElement
      }

      toggleStoreDialogState('add')

      contentEntered.value = false
    }

    const onEnter = async () => {
      await sleep(oneFrame * 4)

      if (modelSync.value && !props.value.trapTabFocus) {
        canNavigate.value = true

        await sleep(oneFrame)

        arrowNavigate({
          type: 'keydown',
          code: 'ArrowDown',
          keyCode: 40,
          preventDefault: () => {},
          stopPropagation: () => {},
          target: null,
        } as KeyboardEvent)
      }

      if (props.value.trapTabFocus && contentRef.value) {
        if (!contentRef.value.contains(document.activeElement)) {
          contentRef.value.focus()
        }
      }
    }

    const onAfterEnter = () => {
      contentEntered.value = true
    }

    const onLeave = () => {
      contentEntered.value = false

      if (props.value.restoreFocus && dialogs.value.length) {
        previousFocus.value && previousFocus.value.focus()

        previousFocus.value = null
      }
    }

    const onAfterLeave = () => {
      toggleStoreDialogState()

      popperInstance.value?.destroy()

      contentEntered.value = false
    }

    const trapTabbing = (evt: KeyboardEvent) => {
      const key = eventKey(evt)

      if (key === 'esc') {
        evt.stopPropagation()

        close()
      } else {
        new UiTrapFocus({ loop: props.value.loopTabbing }).init(evt)
      }
    }

    const clickOnSpaceKeyPressCb = (evt: KeyboardEvent) => {
      if (eventKey(evt) === 'space') {
        clickFocused()
      }
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
      triggerWidth,
      onBeforeEnter,
      onAfterLeave,
      open,
      close,
      toggle,
      focusTriggerInput,
      arrowNavigate,
      onEnter,
      clearFocus,
      onLeave,
      clickFocused,
      onAfterEnter,
      trapTabbing,
      clickOnSpaceKeyPressCb,
    }
  },
})
</script>

<template>
  <div :id="id" data-position>
    <div
      ref="triggerRef"
      @keydown="arrowNavigate"
      @keyup.esc.stop="close"
      @keydown.enter="clickFocused"
      v-on="clickOnSpaceKeyPress ? { keydown: clickOnSpaceKeyPressCb } : {}"
    >
      <slot name="trigger" v-bind="payload" />
    </div>

    <Teleport to="overlay">
      <FadeTransition
        @before-enter="onBeforeEnter"
        @enter="onEnter"
        @leave="onLeave"
        @after-enter="onAfterEnter"
        @after-leave="onAfterLeave"
      >
        <div
          v-if="modelSync"
          :data-id="id"
          class="fixed inset-0 isolate"
          :class="{ 'pointer-events-none': !modelSync || !blockClick }"
          :style="{
            'z-index': `${(indexInDialogs || 1) + 100}`,
            '--fade-enter-duration': enterDuration,
            '--fade-leave-duration': leaveDuration,
            '--fade-enter-delay': enterDelay,
            '--fade-leave-delay': leaveDelay,
          }"
        >
          <div v-if="blockClick" class="absolute inset-0 -z-1" @click="close" />

          <div
            ref="contentRef"
            :tabindex="trapTabFocus ? '0' : undefined"
            :style="{
              minWidth: useTriggerWidth ? triggerWidth : undefined,
              maxWidth: maxWidth,
            }"
            class="combobox pointer-events-auto"
            :class="{ 'outline-none': trapTabFocus }"
            @mousedown="focusTriggerInput"
            @mouseleave="clearFocus"
            v-on="
              trapTabFocus
                ? {
                    keydown: trapTabbing,
                  }
                : {}
            "
          >
            <slot v-bind="payload" />
          </div>
        </div>
      </FadeTransition>
    </Teleport>
  </div>
</template>
