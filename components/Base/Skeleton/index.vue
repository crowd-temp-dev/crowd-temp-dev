<script lang="ts">
import { defineComponent, h, PropType } from '@vue/composition-api'
import { HTMLElementTagNames } from '~/types'

export default defineComponent({
  name: 'BaseSkeleton',
  props: {
    loading: Boolean,
    tag: {
      type: String as PropType<HTMLElementTagNames>,
      default: 'div',
    },
    loadingClass: {
      type: [String, Array, Object],
      default: undefined,
    },
  },
  setup(_props, { slots }) {
    return () => {
      return _props.loading
        ? h(_props.tag, {
            attrs: {
              'aria-label': 'Loading content',
            },
            staticClass: 'animate-pulse pointer-events-none',
            class: _props.loadingClass,
          })
        : slots.default?.()[0]
    }
  },
})
</script>
