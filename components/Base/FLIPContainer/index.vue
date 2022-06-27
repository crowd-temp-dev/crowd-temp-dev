<script lang="ts">
import { left } from '@popperjs/core'
import { defineComponent } from '@vue/composition-api'
import UiTrapFocus from 'ui-trap-focus'
import { oneFrame, sleep, uid } from '~/utils'
import eventKey from '~/utils/eventKey'

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
      required: true,
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
    closeOnEsc: {
      type: Boolean,
      default: true,
    },
    viewPort: {
      type: [Object, String] as unknown as () => DOMRect | string,
      default: 'html',
    },
    triggerViewPort: {
      type: String,
      default: undefined,
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
          } else {
            this.closeOverlay()
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
        if (this.closeOnEsc) {
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

        const contentComputedStyle = getComputedStyle(triggerRef)

        const viewPort = this.getPort(this.viewPort) as DOMRect

        const overlayHeight = `${viewPort.height}px`

        const overlayTop = `${viewPort.top}px`

        const overlayLeft = `${viewPort.left}px`

        const scaleFromX = contentBound.width / viewPort.width

        const scaleFromY = contentBound.height / viewPort.height

        const translateX = `${contentBound.left}px`

        const translateY = `${contentBound.top - viewPort.top}px`

        return {
          height: overlayHeight,
          width: `${viewPort.width}px`,
          top: overlayTop,
          left: overlayLeft,
          visibility: 'hidden',
          clipPath: `inset(0 0 0 0 round ${contentComputedStyle.borderRadius})`,
          transform: `scale3d(${scaleFromX},${scaleFromY},1) translate3d(${translateX},${translateY},0)`,
          transformOrigin: `${translateX} ${translateY}`,
        }
      }

      return {}
    },
    async openOverlay() {
      const triggerRef = this.triggerRef()

      if (triggerRef) {
        const fromStyle = this.getFromStyle()

        this.overlayStyles = {
          ...fromStyle,
          transitionDuration: '0s',
        }

        await this.$nextTick()

        this.showOverlay = true

        await sleep(oneFrame)

        this.overlayStyles = {
          height: fromStyle.height,
          top: fromStyle.top,
          left: fromStyle.left,
          width: fromStyle.width,
          clipPath: 'inset(0 0 0 0 round 0)',
          transform: `scale3d(1,1,1) translate3d(0,0,0)`,
          transformOrigin: fromStyle.transformOrigin,
          transitionDuration: '250ms',
          transitionTimingFunction: 'cubic-bezier(0.1, 0.95, 0.32, 1.05)',
          transitionProperty: 'all',
        }

        await sleep(250)

        if (this.$refs.overlayRef && this.showOverlay) {
          this.$refs.overlayRef.focus()

          this.overlayEntered = true
        }
      }
    },
    async closeOverlay() {
      const triggerRef = this.triggerRef()

      if (triggerRef && this.$refs.overlayRef) {
        this.overlayEntered = false

        this.overlayStyles = {
          ...this.getFromStyle(),
          visibility: '',
          transition: '200ms ease-out',
        }

        await sleep(200)

        if (this.showOverlay) {
          this.showOverlay = false

          if (this.previousActive instanceof HTMLElement) {
            this.previousActive.focus({
              preventScroll: true,
            })

            this.previousActive = null
          }

          this.removeFromDialogs()
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
        on: { ...this.$listeners },
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
                staticClass: 'relative isolate',
                style: {
                  'z-index': `${(this.indexInDialogs || 1) + 100}`,
                },
              },
              [
                this.$scopedSlots?.prepend?.(this.payload),

                expanded
                  ? h(
                      'div',
                      {
                        ref: 'overlayRef',
                        attrs: {
                          tabindex: '0',
                        },
                        staticClass: 'fixed outline-none z-1',
                        class: [this.contentClass],
                        style: {
                          ...this.overlayStyles,
                        },
                        on: {
                          keydown: this.contentKeydown,
                        },
                      },
                      [
                        h(
                          'div',
                          {
                            staticClass: 'transition-opacity h-full w-full',
                            class: [
                              {
                                'opacity-0': !expanded,
                              },
                            ],
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
