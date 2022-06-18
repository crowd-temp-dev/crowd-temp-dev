import { computed, defineComponent } from '@vue/composition-api'
import { AnswerTestState } from '~/store/answer-test'

export default defineComponent({
  name: 'AnswerTestMixin',
  setup(_props, { root }) {
    const loading = computed(() => {
      return (root.$store.state['answer-test'] as AnswerTestState).loading
    })

    return { loading }
  },
})
