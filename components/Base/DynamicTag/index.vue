<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  name: 'DynamicTag',
  props: {
    tag: {
      type: String as () => keyof HTMLElementTagNameMap,
      required: true,
    },
  },
  render(h) {
    return h(
      this.tag,
      {
        attrs: {
          ...this.$attrs,
        },
        on: {
          ...this.$listeners,
        },
      },
      this.$slots.default
    )
  },
})
</script>
