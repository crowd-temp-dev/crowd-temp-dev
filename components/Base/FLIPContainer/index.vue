<script lang="ts">
import { left } from '@popperjs/core'
import { defineComponent } from '@vue/composition-api'
import UiTrapFocus from 'ui-trap-focus'
import { LikeNumber } from '~/types'
import { oneFrame, sleep, uid } from '~/utils'
import eventKey from '~/utils/eventKey'

const enterTransition = {
  duration: 250,
  ease: 'cubic-bezier(0.1, 0.5, 0.32, 1.075)',
  property: 'all',
}

const leaveTransition = {
  duration: 200,
  ease: 'linear',
  property: 'all',
}

export default defineComponent({
  name: 'FLIPContainer',
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  props: {
    modelValue: {
      type: Boolean,
      default: undefined,
    },
    tag: {
      type: String as () => keyof HTMLElementTagNameMap,
      default: 'div',
    },
    contentClass: {
      type: String,
      default: undefined,
    },
    tabSelector: {
      type: String,
      default: '*',
    },
    disabled: Boolean,
    disableEsc: Boolean,
    viewPort: {
      type: [Object, String] as unknown as () => DOMRect | string,
      default: 'html',
    },
    triggerViewPort: {
      type: String,
      default: undefined,
    },
    ignoreBorderRadius: Boolean,
    zIndex: {
      type: String as () => LikeNumber,
      default: undefined,
    },
    zIndexOffset: {
      type: Number,
      default: 100,
    },
    enterTransition: {
      type: Object as () => {
        duration: number
        ease: string
        property: string
      },
      default: () => enterTransition,
    },
    leaveTransition: {
      type: Object as () => {
        duration: number
        ease: string
        property: string
      },
      default: () => leaveTransition,
    },
  },

  data() {
    return {
      id: uid(),
      manualModel: false,
      overlayEntered: false,
      previousActive: null as HTMLElement,
      currentViewPort: {} as DOMRect,
      overlayStyles: {},
      showOverlay: !!this.modelValue,
    }
  },

  computed: {
    modelSync: {
      get() {
        if (typeof this.modelValue === 'boolean') {
          return this.modelValue
        }

        return this.manualModel
      },
      set(val: boolean) {
        if (typeof val === 'boolean') {
          if (val && this.disabled) {
            return
          }

          if (typeof this.modelValue === 'boolean') {
            this.$emit('update:modelValue', val)
          }

          this.manualModel = val

          if (val) {
            this.previousActive = document.activeElement
            this.addToDialogs()

            this.openOverlay()

            document.body.addEventListener('focusin', this.restoreFocus)
          } else {
            this.closeOverlay()

            document.body.removeEventListener('focusin', this.restoreFocus)
          }
        }
      },
    },
    payload() {
      return {
        showOverlay: this.showOverlay,
        active: this.modelSync,
        toggle: this.toggle,
        open: this.open,
        close: this.close,
        overlayEntered: this.overlayEntered,
      }
    },
    dialogs() {
      return this.$store.state.app.dialogs as string[]
    },
    indexInDialogs() {
      return this.dialogs.indexOf(this.id)
    },
    isFurthestDialog() {
      return this.indexInDialogs === this.dialogs.length - 1
    },
  },

  watch: {
    disabled(nv) {
      if (nv) {
        this.modelSync = false
      }
    },
    '$route.fullPath'() {
      this.modelSync = false
    },
  },

  created() {
    this.addToDialogs()
  },

  beforeDestroy() {
    this.removeFromDialogs()
  },

  methods: {
    triggerRef() {
      if (typeof this.triggerViewPort === 'string') {
        const el = document.querySelector(this.triggerViewPort)

        if (el) {
          return el
        }
      }

      const triggerSlot = this.$scopedSlots?.trigger(this.payload)?.[0] || null

      if (triggerSlot) {
        if (triggerSlot.context) {
          return triggerSlot.context.$el
        }

        return triggerSlot.elm || null
      }

      return null
    },
    toggle(val?: boolean) {
      this.modelSync = typeof val === 'boolean' ? val : !this.modelSync
    },
    open() {
      this.toggle(true)
    },
    close() {
      this.toggle(false)
    },
    contentKeydown(evt: KeyboardEvent) {
      const key = eventKey(evt)

      if (key === 'esc') {
        if (!this.disableEsc) {
          this.modelSync = false
        }
      } else {
        const trapFocus = new UiTrapFocus({
          children: this.tabSelector,
        })

        trapFocus.init(evt)
      }
    },
    removeFromDialogs() {
      this.$store.commit('app/removeFromDialogs', this.id)
    },
    addToDialogs() {
      if (this.modelSync) {
        this.$store.commit('app/addToDialogs', this.id)
      }
    },
    getPort(prop: string | DOMRect) {
      const { clientHeight, clientWidth } = document.documentElement

      const documentViewPort = {
        x: 0,
        y: 0,
        width: clientWidth,
        height: clientHeight,
      }

      if (typeof prop === 'object') {
        const height = Math.min(prop.height, documentViewPort.height)
        const width = Math.min(prop.width, documentViewPort.width)
        const x = Math.max(prop.x, documentViewPort.x)
        const y = Math.max(prop.y, documentViewPort.y)

        return {
          height,
          width,
          x,
          y,
          top: y,
          left: x,
          bottom: y + height,
          right: x + left,
        }
      } else if (typeof prop === 'string') {
        const el = document.querySelector(prop) as HTMLElement

        let domRect = {} as DOMRect

        if (el) {
          domRect = el.getBoundingClientRect().toJSON()
        } else {
          const { width, height, x, y } = documentViewPort

          domRect = {
            x,
            y,
            width,
            height,
            top: y,
            right: x + width,
            bottom: y + height,
            left: x,
          } as DOMRect
        }

        return domRect
      }

      return {}
    },
    getFromStyle() {
      const triggerRef = this.triggerRef()

      if (triggerRef instanceof HTMLElement) {
        const contentBound = triggerRef.getBoundingClientRect()

        const contentComputedStyle = this.ignoreBorderRadius
          ? {}
          : getComputedStyle(triggerRef)

        const viewPort = this.getPort(this.viewPort) as DOMRect

        const overlayHeight = `${viewPort.height}px`

        const overlayTop = `${viewPort.top}px`

        const overlayLeft = `${viewPort.left}px`

        const scaleFromX = contentBound.width / viewPort.width

        const scaleFromY = contentBound.height / viewPort.height

        const translateX = `${contentBound.left - viewPort.left}px`

        const translateY = `${contentBound.top - viewPort.top}px`

        const borderRadius = this.ignoreBorderRadius
          ? {}
          : {
              clipPath: `inset(0 0 0 0 round ${
                (contentComputedStyle as CSSStyleDeclaration).borderRadius
              })`,
            }

        return {
          styles: {
            height: overlayHeight,
            width: `${viewPort.width}px`,
            top: overlayTop,
            left: overlayLeft,
            visibility: 'hidden',
            ...borderRadius,
            transform: `scale3d(${scaleFromX},${scaleFromY},1) translate3d(${translateX},${translateY},0)`,
            transformOrigin: `${translateX} ${translateY}`,
          },
          triggerRef,
        }
      }

      return {}
    },
    async openOverlay() {
      if (!this.showOverlay) {
        this.$emit('leaveCancelled')
      }

      this.$emit('beforeEnter')

      const { triggerRef, styles: fromStyle } = this.getFromStyle()

      if (triggerRef) {
        this.overlayStyles = {
          ...fromStyle,
          transitionDuration: '0s',
          willChange: 'transform,opacity',
        }

        await this.$nextTick()

        this.$emit('enter')

        this.showOverlay = true

        await sleep(oneFrame)

        const transition = {
          ...enterTransition,
          ...this.enterTransition,
        }

        const enterDuration = transition.duration

        this.overlayStyles = {
          height: fromStyle.height,
          top: fromStyle.top,
          left: fromStyle.left,
          width: fromStyle.width,
          clipPath: 'inset(0 0 0 0 round 0)',
          transform: `scale3d(1,1,1) translate3d(0,0,0)`,
          transformOrigin: fromStyle.transformOrigin,
          transitionDuration: `${enterDuration}ms`,
          transitionTimingFunction: transition.ease,
          transitionProperty: transition.property,
          willChange: 'transform,opacity',
        }

        await sleep(enterDuration)

        if (this.$refs.overlayRef && this.showOverlay) {
          this.$refs.overlayWrapper?.focus()

          this.overlayEntered = true

          this.$emit('afterEnter')
        }
      }
    },
    async closeOverlay() {
      if (!this.overlayEntered) {
        this.$emit('enterCancelled')
      }

      this.$emit('beforeLeave')

      const { triggerRef, styles: toStyles } = this.getFromStyle()

      if (triggerRef && this.$refs.overlayRef) {
        // ;(triggerRef as HTMLElement).scrollIntoView()

        this.overlayEntered = false

        const transition = {
          ...leaveTransition,
          ...this.leaveTransition,
        }

        const leaveDuration = transition.duration

        this.overlayStyles = {
          ...toStyles,
          visibility: '',
          transition: `${leaveDuration}ms ${transition.ease}`,
          transitionProperty: transition.property,
          willChange: 'transform,opacity',
        }

        await this.$nextTick()

        this.$emit('leave')

        await sleep(leaveDuration)

        if (this.showOverlay) {
          this.showOverlay = false

          this.$emit('afterLeave')

          if (
            this.previousActive instanceof HTMLElement &&
            document.contains(this.previousActive)
          ) {
            this.previousActive.focus({
              preventScroll: true,
            })
          }

          this.previousActive = null

          this.removeFromDialogs()
        }
      }
    },
    restoreFocus(evt: FocusEvent) {
      if (!this.modelSync) {
        return
      }

      const overlayWrapper = this.$refs.overlayWrapper
      if (overlayWrapper instanceof HTMLElement) {
        if (
          evt.target !== overlayWrapper &&
          !overlayWrapper.contains(evt.target as HTMLElement)
        ) {
          overlayWrapper.focus()
        }
      }
    },
  },

  render(h) {
    const expanded = this.showOverlay

    return h(
      this.tag,
      {
        attrs: { ...this.$attrs },
        on: {
          ...this.$listeners,
        },
      },
      [
        this.$scopedSlots?.trigger(this.payload)?.[0] || null,

        h(
          'Teleport',
          {
            props: {
              to: 'overlay',
              multiple: true,
            },
          },
          [
            h(
              'div',
              {
                ref: 'overlayWrapper',
                attrs: {
                  tabindex: this.modelSync ? '1' : undefined,
                },
                staticClass: 'relative isolate outline-none',
                style: {
                  'z-index':
                    this.zIndex ||
                    `${(this.indexInDialogs || 1) + this.zIndexOffset}`,
                },
                directives: [
                  {
                    name: 'show',
                    value: this.showOverlay || this.modelSync,
                  },
                ],
                on: {
                  keydown: this.contentKeydown,

                  click: (evt: PointerEvent) => {
                    if (this.modelSync) {
                      const overlayEl = this.$refs.overlayRef

                      if (overlayEl instanceof HTMLElement) {
                        const target = evt.target as HTMLElement

                        if (
                          target !== overlayEl &&
                          !overlayEl.contains(target)
                        ) {
                          overlayEl.focus({ preventScroll: true })
                        }
                      }
                    }
                  },
                },
              },
              [
                this.$scopedSlots?.prepend?.(this.payload),

                expanded
                  ? h(
                      'div',
                      {
                        ref: 'overlayRef',
                        staticClass: 'fixed z-1',
                        class: [this.contentClass],
                        style: {
                          ...this.overlayStyles,
                        },
                      },
                      [
                        h(
                          'div',
                          {
                            staticClass:
                              'transition-opacity h-full w-full overflow-hidden',
                            class: [
                              {
                                'opacity-0': !expanded,
                              },
                            ],
                            staticStyle: {
                              clipPath: 'inherit',
                            },
                          },
                          [this.$scopedSlots?.content?.(this.payload) || null]
                        ),
                      ]
                    )
                  : null,

                this.$scopedSlots?.append?.(this.payload),
              ]
            ),
          ]
        ),
      ]
    )
  },
})
</script>
