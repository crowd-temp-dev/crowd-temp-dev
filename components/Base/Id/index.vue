<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import { uuidv4, uid } from '~/utils'

export default defineComponent({
  name: 'BaseIdProvider',
  props: {
    uuid: Boolean,
    id: {
      type: String,
      default: undefined,
    },
  },

  setup(_props, { slots }) {
    const id = ref(_props.id || (_props.uuid ? uuidv4() : uid()))

    return () => slots?.default?.({ id: id.value })[0]
  },
})
</script>
