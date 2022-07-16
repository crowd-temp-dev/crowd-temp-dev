import { computed, defineComponent } from '@vue/composition-api'
import { RootState } from '~/store'
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
      return (root.$store.state as RootState).testSuite.viewResult.questions[
        `question-${_props.numbering}`
      ].followUpQuestions
    })

    return { followUpQuestions, getAlphabets }
  },
})
