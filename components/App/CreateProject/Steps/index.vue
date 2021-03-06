<script lang="ts">
/* eslint-disable vue/no-unused-components */
import { defineComponent, computed } from '@vue/composition-api'
import PrototypeEvaluation from './PrototypeEvaluation/index.vue'
import WebsiteEvaluation from './WebsiteEvaluation/index.vue'
import FiveSecondTest from './FiveSecondTest/index.vue'
import PreferenceTest from './PreferenceTest/index.vue'
import ThankYouScreen from './ThankYouScreen/index.vue'
import CustomMessage from './CustomMessage/index.vue'
import WelcomeScreen from './WelcomeScreen/index.vue'
import SimpleSurvey from './SimpleSurvey/index.vue'
import DesignSurvey from './DesignSurvey/index.vue'
import CardSorting from './CardSorting/index.vue'
import AddNewTest from './AddNewTest/index.vue'
import TestDetails from './TestDetails/index.vue'
import ClickTest from './ClickTest/index.vue'
import Form from './Form/index.vue'
import { HTMLFormInput, OnSubmit } from '~/types'
import { TestSuiteState } from '~/store/projectSuite'
import { pingAddNewTestBtn, sleep } from '~/utils'

export default defineComponent({
  name: 'AppProjectSteps',
  components: {
    TestDetails,
    WelcomeScreen,
    DesignSurvey,
    PreferenceTest,
    FiveSecondTest,
    PrototypeEvaluation,
    SimpleSurvey,
    ClickTest,
    CardSorting,
    CustomMessage,
    ThankYouScreen,
    AddNewTest,
    WebsiteEvaluation,
    Form,
  },
  setup(_, { root: { $store } }) {
    const onSubmit: OnSubmit<Record<string, any>> = async () => {
      const state = ($store.state.projectSuite as TestSuiteState).create

      if (state.submitting) {
        return
      }

      if (!state.section.items.length) {
        pingAddNewTestBtn()

        return
      }

      const collapsedSections = !!state.collapsed.items.length

      $store.commit('projectSuite/create/collapsed/reset')

      await sleep(collapsedSections ? 200 : 0)

      // get all forms
      const allForms: HTMLFormElement[] = Array.from(
        document
          .getElementById('project-form-wrapper')
          ?.querySelectorAll('.FormLayout') || []
      )

      if (allForms.length) {
        // loop through all forms, and submit the invalid forms, so the can be scrolled into view
        // The last index, which is this form should then submit vuex values
        allForms.every((form, index) => {
          const formElements = Array.from(form.elements) as HTMLFormInput[]

          if (index < allForms.length - 1) {
            !form.checkValidity() &&
              form.dispatchEvent(
                new Event('submit', {
                  bubbles: true,
                  cancelable: true,
                })
              )

            return form.checkValidity()
          } else {
            formElements.forEach((element) => {
              element.dataset.previousDisabled = String(
                element.disabled ? 1 : 0
              )
              ;(element as HTMLFormInput).disabled = true
            })

            // submit
            $store.dispatch('projectSuite/create/submit').then(() => {
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

            return true
          }
        })
      }
    }

    const questions = computed(() => {
      return ($store.state.projectSuite as TestSuiteState).create.section.items
    })

    return { onSubmit, questions }
  },
})
</script>

<template>
  <div id="project-form-wrapper" class="grid gap-y-20">
    <TestDetails />

    <WelcomeScreen />

    <template v-if="questions.length">
      <TransitionGroup
        tag="div"
        enter-class="!opacity-0"
        move-class="transition-opacity"
        enter-active-class="transition-opacity delay-[50ms]"
        leave-active-class="transition-opacity delay-[50ms]"
        leave-to-class="!opacity-0"
        class="grid gap-y-20"
      >
        <Component
          :is="type"
          v-for="({ type, id }, i) in questions"
          v-bind="{
            rootNumber: i + 1,
            id,
          }"
          :key="id"
        />
      </TransitionGroup>
    </template>

    <div v-else class="mb-16 fade-appear">
      <AddNewTest id="add-new-test" />
    </div>

    <ThankYouScreen />

    <section>
      <Form name="trigger-submit-form" class="sr-only" @on-submit="onSubmit" />
    </section>
  </div>
</template>
