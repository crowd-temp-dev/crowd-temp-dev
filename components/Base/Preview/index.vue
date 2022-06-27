<script lang="ts">
import { defineComponent, computed, h } from '@vue/composition-api'

export default defineComponent({
  name: 'BasePreview',
  setup(_props, { slots }) {
    const payload = computed(() => ({}))

    return () => {
      return h('div', {}, [
        // slider
        h('ul', {}, [
          slots.default?.(payload).map((vnode, index) => {
            return h(
              'li',
              {
                key: `li-${index}`,
              },
              [vnode]
            )
          }),
        ]),

        // floating footer
        h('div', {}, []),
      ])
    }
  },
})
</script>
