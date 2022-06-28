import { computed, defineComponent } from '@vue/composition-api'
import { ViewResultState } from '~/store/create-test/view-result'
import { getAlphabets } from '~/utils'

export default defineComponent({
  props: {
    numbering: {
      type: Number,
      required: true,
    },
  },
  setup(_props, { root }) {
    const followUpQuestions = computed(() => {
      return (
        root.$store.state['create-test']['view-result'] as ViewResultState
      ).questions[`question-${_props.numbering}`].followUpQuestions
    })

    return { followUpQuestions, getAlphabets }
  },
})
