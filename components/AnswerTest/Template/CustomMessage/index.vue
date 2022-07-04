<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import { OnSubmit } from '~/types'

export default defineComponent({
  name: 'AnswerTestTemplateCustomMessage',

  setup(_, { root }) {
    const questionIndex = computed(() =>
      parseFloat(root.$route.params.question)
    )

    const questionIndexAndLetter = computed(() =>
      root.$route.params.question.replace(/-instruction/, '')
    )

    const currentSection = computed(() => {
      return (
        root.$store.state['answer-test'].form[
          `question-${questionIndex.value}`
        ] || {}
      )
    })

    const onSubmit: OnSubmit<{ 'message-value-checkbox': true }> = async ({
      formValues,
      toggleLoading,
    }) => {
      toggleLoading(false)

      await root.$store.dispatch('answer-test/answerQuestion', [
        String(Number(formValues['message-value-checkbox'])),
      ])

      toggleLoading(true)
    }

    return { questionIndex, questionIndexAndLetter, currentSection, onSubmit }
  },
})
</script>

<template>
  <div>
    <PEmptyState class="max-w-[760px] mx-auto w-full h-fit mt-[4%]">
      <div class="grid justify-items-center justify-center">
        <Img
          src="static/png/app/Home/test-list/empty-state"
          class="mb-32 h-172"
        />

        <p
          class="font-sf-pro-display text-display-small text-text-default mb-8"
        >
          <strong> {{ currentSection.title }} </strong>
        </p>

        <p class="text-[#202123] text-center">
          {{ currentSection.message }}
        </p>

        <FormLayout
          v-slot="{ loading }"
          name="message-value"
          @on-submit="onSubmit"
        >
          <input
            id="message-value-checkbox"
            tabindex="0"
            class="sr-only"
            required
            checked
            type="checkbox"
          />

          <Button primary type="submit" :loading="loading"> Continue </Button>
        </FormLayout>
      </div>
    </PEmptyState>
  </div>
</template>
