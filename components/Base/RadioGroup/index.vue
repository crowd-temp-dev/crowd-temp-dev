<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
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
  },
  setup(_props) {
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

          inputs.forEach((input) => {
            input.checked = false
          })

          const currentInput = inputs.find((input) => input.isSameNode(exempt))

          if (currentInput) {
            currentInput.checked = true

            currentInput.focus()
          }

          clearDebounce()
        }
      }, 64)
    }

    const onArrowKeysPress = (evt: KeyboardEvent) => {
      if (/^(?:arrow)(?:up|right|down|left)$/i.test(evt.key)) {
        evt.preventDefault()

        new TrapFocus({
          forward: () => /(?:down|right)$/i.test(evt.key),
          backward: () => /(?:up|left)$/i.test(evt.key),
          loop: true,
          children: 'input',
        })
          .init(evt)
          .then(async (el) => {
            if (el) {
              clearInputs(el as HTMLInputElement)

              await sleep()

              el.click()
              ;(el as HTMLInputElement).checked = true
            }
          })
      }
    }

    const clearOtherInputs = (evt: PointerEvent) => {
      if (evt.target) {
        // make sure we're hitting an input that's in a label
        let label = (evt.target as HTMLElement).closest('label')

        if (!label && evt.currentTarget !== evt.target) {
          label = (evt.target as HTMLElement).querySelector('label')
        }

        if (label) {
          const input = label.querySelector('input') as HTMLInputElement | null

          if (input) {
            value.value = input.value || input.name

            clearInputs(input)
          }
        }
      }
    }

    return { root, value, onArrowKeysPress, clearOtherInputs }
  },
})
</script>

<template>
  <div
    ref="root"
    role="radiogroup"
    @keydown="onArrowKeysPress"
    @click="clearOtherInputs"
  >
    <div class="relative" :class="contentClass">
      <slot />

      <input
        :id="id"
        tabindex="-1"
        :value="value"
        data-pseudo-input="true"
        class="sr-only absolute position-center"
        required
      />
    </div>

    <PInlineError v-if="error" class="mt-4" :field-id="id" :message="error" />
  </div>
</template>
