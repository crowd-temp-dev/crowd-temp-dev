<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import copyText from '~/utils/copyText'

export default defineComponent({
  name: 'BaseCopyText',
  props: {
    text: {
      type: String,
      default: undefined,
    },
    errorMessage: {
      type: String,
      default: 'Error copying',
    },
    successMessage: {
      type: String,
      default: undefined,
    },
  },
  emits: ['on-copy', 'on-error'],
  setup(_props, { emit, root, slots }) {
    const copy = async () => {
      if (!_props.text) {
        return
      }

      await copyText({
        text: _props.text,
        onError: () => {
          if (_props.errorMessage) {
            root.$pToast.open({
              error: true,
              message: _props.errorMessage,
            })
          }

          emit('on-error')
        },
        onSuccess: () => {
          if (_props.successMessage) {
            root.$pToast.open({
              message: _props.successMessage,
            })
          }

          emit('on-success')
        },
      })
    }

    return () => slots.default?.({ copy })[0]
  },
})
</script>
