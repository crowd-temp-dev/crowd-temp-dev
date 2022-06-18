<script lang="ts">
/* eslint-disable vue/no-unused-components */
import { defineComponent } from '@vue/composition-api'
import PrototypeEvaluation from './PrototypeEvaluation/index.vue'
import WebsiteEvaluation from './WebsiteEvaluation/index.vue'
import FiveSecondsTest from './FiveSecondsTest/index.vue'
import PreferenceTest from './PreferenceTest/index.vue'
import ThankYouScreen from './ThankYouScreen/index.vue'
import CustomMessage from './CustomMessage/index.vue'
import WelcomeScreen from './WelcomeScreen/index.vue'
import SimpleSurvey from './SimpleSurvey/index.vue'
import DesignSurvey from './DesignSurvey/index.vue'
import CardSorting from './CardSorting/index.vue'
import AddNewBlock from './AddNewBlock/index.vue'
import TestDetails from './TestDetails/index.vue'
import ClickTest from './ClickTest/index.vue'
import Form from './Form/index.vue'
import { HTMLFormInput, OnSubmit } from '~/types'

export default defineComponent({
  name: 'AppCreateTestSteps',
  components: {
    TestDetails,
    WelcomeScreen,
    DesignSurvey,
    PreferenceTest,
    FiveSecondsTest,
    PrototypeEvaluation,
    SimpleSurvey,
    ClickTest,
    CardSorting,
    CustomMessage,
    ThankYouScreen,
    AddNewBlock,
    WebsiteEvaluation,
    Form,
  },
  setup(_, { root: { $store } }) {
    const onSubmit: OnSubmit<Record<string, any>> = () => {
      if ($store.state['create-test'].submitting) {
        return
      }

      // get all forms
      const allForms: HTMLFormElement[] = Array.from(
        document
          .getElementById('create-test-form-wrapper')
          ?.querySelectorAll('.FormLayout') || []
      )

      if (allForms.length) {
        // loop through all forms, and submit the invalid forms, so the can be scrolled into view
        // The last index, which is this form should then submit vuex values
        allForms.forEach((form, index) => {
          const formElements = Array.from(form.elements) as HTMLFormInput[]

          if (index < allForms.length - 1) {
            !form.checkValidity() &&
              form.dispatchEvent(
                new Event('submit', {
                  bubbles: true,
                  cancelable: true,
                })
              )
          } else {
            // disable fields
            allForms.forEach((form) => {
              form.classList.add('opacity-70', 'grayscale')

              formElements.forEach((element) => {
                element.dataset.previousDisabled = String(
                  element.disabled ? 1 : 0
                )
                ;(element as HTMLFormInput).disabled = true
              })
            })

            // submit
            $store.dispatch('create-test/submit').then(() => {
              // enable fields
              allForms.forEach((form) => {
                form.classList.remove('opacity-70', 'grayscale')

                formElements.forEach((element) => {
                  element.dataset.previousDisabled = String(
                    element.disabled ? 1 : 0
                  )

                  const disabled = Boolean(
                    Number(element.dataset.previousDisabled) === 1
                  )

                  ;(element as HTMLFormInput).disabled = disabled

                  disabled && element.removeAttribute('disabled')                

                  delete element.dataset.previousDisabled
                })
              })
            })
          }
        })
      }
    }

    return { onSubmit }
  },
})
</script>

<template>
  <div id="create-test-form-wrapper" class="grid gap-y-20">
    <TestDetails />
    <WelcomeScreen />

    <template v-if="$createTestForm.questionsLength">
      <Component
        :is="type"
        v-for="({ type, id }, i) in $createTestForm.questions"
        v-bind="{
          rootNumber: i + 1,
          id,
        }"
        :key="id"
      />
    </template>

    <div v-else class="mb-16 fade-appear">
      <AddNewBlock id="add-new-block" />
    </div>

    <ThankYouScreen />

    <Form name="trigger-submit-form" class="sr-only" @on-submit="onSubmit" />
  </div>
</template>
