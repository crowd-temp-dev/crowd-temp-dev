<script lang="ts">
import { defineComponent, h, computed, ref } from '@vue/composition-api'
import type { Placement } from '@popperjs/core'
import Button from '~/components/Base/Button/index.vue'
import ComboBox from '~/components/Base/ComboBox/index.vue'
import type { ComboBoxPayload } from '~/components/Base/ComboBox/index.vue'

import { pseudoFocusOnMouseEnter } from '~/utils'
import eventKey from '~/utils/eventKey'
import { Duration } from '~/types'

export interface DropdownOption {
  title: string
  onClick: (evt?: PointerEvent) => void
  prependIcon?: string
  appendIcon?: string
  disabled?: boolean
  selected?: boolean
}

const scoping = { 'data-dropdown': '' }

export default defineComponent({
  name: 'BaseDropdown',
  components: { Button },
  model: {
    event: 'update:modelValue',
    prop: 'modelValue',
  },
  props: {
    blockClick: Boolean,
    option: {
      type: Array as () => DropdownOption[],
      default: () => [],
    },
    loopTabbing: {
      type: Boolean,
      default: true,
    },
    modelValue: {
      type: Boolean,
      default: undefined,
    },
    placement: {
      type: String as () => Placement,
      default: 'bottom-end',
    },
    offset: {
      type: Array as unknown as () => [number, number],
      default: () => [0, 14],
    },
    active: {
      type: Boolean,
      default: undefined,
    },
    leaveDuration: {
      type: String as () => Duration,
      default: '300ms',
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
    contentClass: {
      type: String,
      default: undefined,
    },
  },
  setup(_props, { emit, slots }) {
    const props = computed(() => _props)

    const manualModel = ref(props.value.active)

    const modelSync = computed({
      get() {
        if (typeof props.value.modelValue === 'boolean') {
          return props.value.modelValue
        }

        return manualModel.value
      },
      set(val: boolean) {
        if (typeof val === 'boolean') {
          if (typeof props.value.modelValue === 'boolean') {
            emit('update:modelValue', val)
          }

          manualModel.value = val
        }
      },
    })

    return () =>
      h(ComboBox, {
        props: {
          offset: props.value.offset,
          placement: props.value.placement,
          modelValue: modelSync.value,
          blockClick: props.value.blockClick,
          leaveDuration: props.value.leaveDuration,
          enterDuration: props.value.enterDuration,
          leaveDelay: props.value.leaveDelay,
          enterDelay: props.value.enterDelay,
          loopTabbing: props.value.loopTabbing,
        },
        on: {
          'update:modelValue': (val: boolean) => {
            modelSync.value = val
          },
        },
        scopedSlots: {
          trigger: (slotProps: ComboBoxPayload) => {
            const events = {
              click: slotProps.toggle,
              keydown: (evt: KeyboardEvent) => {
                const key = eventKey(evt)

                if (key === 'arrow_down') {
                  evt.preventDefault()

                  slotProps.open()
                } else if (key === 'esc') {
                  evt.stopPropagation()

                  slotProps.close()
                }
              },
              blur: slotProps.close,
            }

            return slots?.default?.({
              ...slotProps,
              events,
            })
          },

          default: (slotProps: ComboBoxPayload) => {
            return h(
              'div',
              {
                staticClass:
                  'shadow-3 rounded-lg bg-surface-default fade-enter:scale-[0.95] fade-enter:opacity-0  transform-gpu transition-[transform,opacity] fade-leave-to:scale-[0.95] fade-leave-to:opacity-0 origin-[top_right]',
                class: props.value.contentClass,
              },
              [
                slots?.append?.(slotProps),

                typeof slots?.content === 'undefined'
                  ? [
                      h(
                        'menu',
                        {
                          staticClass: 'py-8',
                        },
                        props.value.option.map((item: DropdownOption, key) => {
                          const getIcon = (position: 'prepend' | 'append') => {
                            const icon = item[`${position}Icon`]

                            return icon
                              ? h('PIcon', {
                                  props: {
                                    source: icon,
                                  },
                                  staticClass:
                                    'fill-icon-default shrink-0 mr-16',
                                  class: {
                                    'opacity-40': item.disabled,
                                  },
                                })
                              : null
                          }

                          return h(
                            'li',
                            {
                              key,
                              attrs: {
                                role: 'menuitem',
                                ...scoping,
                                'data-disabled': item.disabled || undefined,
                              },
                              staticClass: 'pseudo-focus dropdown-item',

                              on: {
                                mouseenter: pseudoFocusOnMouseEnter,
                                click: (evt: PointerEvent) => {
                                  item.onClick?.(evt)
                                },
                              },
                            },
                            [
                              getIcon('prepend'),

                              h(
                                'span',
                                {
                                  staticClass: 'flex-grow',
                                },
                                [item.title]
                              ),

                              getIcon('append'),
                            ]
                          )
                        })
                      ),
                    ]
                  : typeof slots?.content === 'function'
                  ? slots.content({
                      events: {
                        mouseenter: pseudoFocusOnMouseEnter,
                      },
                      ...slotProps,
                    })
                  : slots?.content || null,

                slots?.prepend?.(slotProps),
              ]
            )
          },
        },
      })
  },
})
</script>
