import { defineComponent, ref, watch } from '@vue/composition-api'

export default defineComponent({
  setup(_, { root: { $user } }) {
    const changed = ref(false)

    const formChanged = () => {
      changed.value = true
    }

    const formRevert = () => {
      changed.value = false
    }

    watch(
      () => $user.id,
      () => {
        changed.value = false
      }
    )

    return { changed, formChanged, formRevert }
  },
})
