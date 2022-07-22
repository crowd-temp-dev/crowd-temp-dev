import {
  ComponentInstance,
  computed,
  defineComponent,
  nextTick,
  onMounted,
  ref,
  watch,
} from '@vue/composition-api'
import { isHTML } from '~/components/Base/Intersection/utils'
import { sleep } from '~/utils'

export default defineComponent({
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },

  props: {
    required: Boolean,
    disabled: Boolean,
    autofocus: Boolean,
    readonly: Boolean,
    selectOnMount: Boolean,
    id: {
      type: String,
      default: undefined,
    },
    label: {
      type: String,
      default: undefined,
    },
    helpText: {
      type: String,
      default: undefined,
    },
    type: {
      type: String,
      default: 'text',
    },
    pattern: {
      type: String,
      default: undefined,
    },
    validate: {
      type: Function,
      default: undefined,
    },
  },
  setup(_props) {
    const root = ref(null)

    const props = computed(() => _props)

    const getInput = () => {
      const vnode = root.value as unknown as ComponentInstance

      if (vnode) {
        const rootEl = (isHTML(vnode) ? vnode : vnode.$el) as HTMLElement

        if (rootEl) {
          const input =
            rootEl.querySelector('input') || rootEl.querySelector('textarea')

          if (input) {
            return input
          }
        }
      }

      return null
    }

    const setInputAttrs = () => {
      const input = getInput()

      if (input) {
        input.required = props.value.required

        input.readOnly = props.value.readonly

        input.tabIndex = input.readOnly ? -1 : undefined

        if (
          props.value.pattern &&
          input instanceof HTMLInputElement &&
          input.type === 'text'
        ) {
          input.pattern = props.value.pattern
        } else {
          !props.value.pattern && input.removeAttribute('pattern')
        }
      }
    }

    const autofocus = async () => {
      await sleep()

      if (props.value.autofocus) {
        const input = getInput()

        if (input) {
          input.focus()
        }
      }
    }

    const triggerSelect = () => {
      if (props.value.selectOnMount) {
        const input = getInput()

        if (input) {
          input.select()
        }
      }
    }

    onMounted(() => {
      nextTick(() => {
        autofocus()

        setInputAttrs()

        triggerSelect()
      })
    })

    watch(() => props.value.required, setInputAttrs)

    watch(() => props.value.pattern, setInputAttrs)

    watch(() => props.value.autofocus, setInputAttrs)

    return { root }
  },
  watch: {
    modelValue(val) {
      if (typeof this.validate === 'function') {
        const validateValue = this.validate(val)

        const errorMessage =
          typeof validateValue === 'string' ? validateValue : ''

        const input = (
          this.root as unknown as ComponentInstance
        ).$el.querySelector('input')

        if (input) {
          input.setCustomValidity(errorMessage)
        }
      }
    },
  },
})
