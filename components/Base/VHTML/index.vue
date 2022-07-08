<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  name: 'BaseVHTML',
  props: {
    useHtml: {
      type: Boolean,
      default: true,
    },
    tag: {
      type: String as () => keyof HTMLElementTagNameMap,
      default: 'span',
    },
    text: {
      type: String,
      required: true,
    },
  },
  render(h) {
    const vHtml = this.useHtml

    return h(
      this.tag,
      {
        attrs: {
          ...this.$attrs,
        },
        on: {
          ...this.$listeners,
        },
        domProps: {
          innerHTML: vHtml ? this.text : undefined,
        },
      },
      vHtml ? null : [this.text]
    )
  },
})
</script>
