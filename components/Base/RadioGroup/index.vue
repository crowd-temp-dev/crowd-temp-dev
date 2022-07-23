<script lang="ts">
import { defineComponent, ref, watch } from '@vue/composition-api'
import TrapFocus from 'ui-trap-focus'
import { sleep } from '~/utils'

export default defineComponent({
  name: 'BaseRadioGroup',
  props: {
    required: Boolean,
    error: {
      type: String,
      default: undefined,
    },
    id: {
      type: String,
      required: true,
    },
    contentClass: {
      type: String,
      default: undefined,
    },
    disableVerticalTabing: Boolean,
    disableHorizontalTabing: Boolean,
    noLoop: Boolean,
  },
  emits: ['on-change'],
  setup(_props, { emit }) {
    const root = ref<HTMLElement | null>(null)

    const value = ref()

    const debounceTimeout = ref<NodeJS.Timeout>()

    const clearDebounce = () => {
      if (debounceTimeout.value) {
        clearTimeout(debounceTimeout.value)
      }
    }

    const clearInputs = (exempt: HTMLInputElement) => {
      clearDebounce()

      debounceTimeout.value = setTimeout(() => {
        if (root.value) {
          const inputs: HTMLInputElement[] = Array.from(
            root.value.querySelectorAll(`input:not(#${_props.id})`)
          )

          const currentInput = inputs.find((input) => input.isSameNode(exempt))

          inputs.forEach((input) => {
            input.checked = false

            if (input !== currentInput) {
              input.dispatchEvent(new Event('change'))
            }
          })

          if (currentInput) {
            currentInput.checked = true

            currentInput.dispatchEvent(new Event('change'))

            currentInput.focus()
          }

          clearDebounce()
        }
      }, 32)
    }

    const onArrowKeysPress = (evt: KeyboardEvent) => {
      let keyRegExpArray = ['up', 'down', 'right', 'left']

      if (_props.disableHorizontalTabing) {
        keyRegExpArray = keyRegExpArray.filter((x) => !/left|right/.test(x))
      }

      if (_props.disableVerticalTabing) {
        keyRegExpArray = keyRegExpArray.filter((x) => !/up|down/.test(x))
      }

      if (/^arrow/i.test(evt.key)) {
        if (
          new RegExp(`^(?:arrow)(?:${keyRegExpArray.join('|')})$`, 'i').test(
            evt.key
          )
        ) {
          evt.preventDefault()

          new TrapFocus({
            forward: () => {
              if (_props.disableHorizontalTabing) {
                return /(?:down)$/i.test(evt.key)
              }
              if (_props.disableVerticalTabing) {
                return /(?:right)$/i.test(evt.key)
              }

              return /(?:down|right)$/i.test(evt.key)
            },
            backward: () => {
              if (_props.disableHorizontalTabing) {
                return /(?:up)$/i.test(evt.key)
              }
              if (_props.disableVerticalTabing) {
                return /(?:left)$/i.test(evt.key)
              }
              return /(?:up|left)$/i.test(evt.key)
            },
            loop: !_props.noLoop,
            children: 'input',
          })
            .init(evt)
            .then(async (_el) => {
              const el = _el as HTMLInputElement
              if (el) {
                clearInputs(el)

                await sleep()

                el.click()
                ;(el as HTMLInputElement).checked = true

                value.value = el.value || el.name
              }
            })
        } else {
          evt.preventDefault()          
        }
      }
    }

    const clearOtherInputs = (evt: PointerEvent) => {
      if (evt.target) {
        // make sure we're hitting an input that's in a label
        const label = (evt.target as HTMLElement).closest('label')

        // if (!label && evt.currentTarget !== evt.target) {
        //   label = (evt.target as HTMLElement).querySelector('label')
        // }

        if (label) {
          const input = label.querySelector('input') as HTMLInputElement | null

          if (input && !input.disabled) {
            value.value = input.value || input.name

            clearInputs(input)
          }
        }
      }
    }

    const focusOnFirstInput = () => {
      if (root.value) {
        const input: HTMLInputElement = root.value.querySelector(
          `input:not(#${_props.id}):not([disabled])`
        )

        if (input) {
          input.focus()
        }
      }
    }

    watch(
      () => value.value,
      (nv) => {
        emit('on-change', nv)
      }
    )

    return {
      root,
      value,
      onArrowKeysPress,
      clearOtherInputs,
      focusOnFirstInput,
    }
  },
})
</script>

<template>
  <div
    ref="root"
    :value="value"
    role="radiogroup"
    @keydown="onArrowKeysPress"
    @click="clearOtherInputs"
  >
    <div class="relative" :class="contentClass">
      <slot />

      <label
        :for="id"
        class="sr-only pointer-events-none absolute position-center"
      >
        <input
          :id="id"
          tabindex="-1"
          :value="value"
          data-pseudo-input
          :required="required"
          @focus="focusOnFirstInput"
        />

        Radio group
      </label>
    </div>

    <PInlineError v-if="error" class="mt-4" :field-id="id" :message="error" />
  </div>
</template>
