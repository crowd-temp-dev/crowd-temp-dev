import { defineComponent } from '@vue/composition-api'

export default function modelSync(
  propConfig = {},
  validate: (val?: any, _props?: any) => boolean = (_) => true,
  prop = 'modelValue',
  event = 'update:modelValue',
  computedName = 'modelSync'
) {
  return defineComponent({
    model: {
      prop,
      event,
    },
    props: {
      [prop]: propConfig,
    },

    computed: {
      [computedName]: {
        // @ts-ignore
        get() {
          // @ts-ignore
          return this[prop]
        },
        set(val: any) {
          if (validate(val, this)) {
            this.$emit(event, val)
          }
        },
      },
    },
  })
}
