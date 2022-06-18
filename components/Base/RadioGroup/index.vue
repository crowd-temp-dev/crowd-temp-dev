<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import TrapFocus from 'ui-trap-focus'
import { sleep } from '~/utils'

export default defineComponent({
  name: 'BaseRadioGroup',
  props: {},
  setup() {
    const root = ref<HTMLElement | null>(null)

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
            root.value.querySelectorAll('input')
          )

          inputs.forEach((input) => {
            input.checked = false

            input.value = 'false'
          })

          const currentInput = inputs.find((input) => input.isSameNode(exempt))

          if (currentInput) {
            currentInput.checked = true

            currentInput.value = 'true'

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
            clearInputs(input)
          }
        }
      }
    }

    return { root, onArrowKeysPress, clearOtherInputs }
  },
})
</script>

<template>
  <label
    ref="root"
    role="radiogroup"
    @keydown="onArrowKeysPress"
    @click="clearOtherInputs"
  >
    <slot />
  </label>
</template>
