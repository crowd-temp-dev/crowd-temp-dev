<script lang="ts">
import { defineComponent, ref, computed } from '@vue/composition-api'
import { Layout, OnSubmit } from '~/types'
import Button from '~/components/Base/Button/index.vue'
import TwoToneBg from '~/components/AnswerTest/TwoToneBg/index.vue'
import TextField from '~/components/Base/TextField/index.vue'
import FormLayout from '~/components/Base/FormLayout/index.vue'
import UiDialog from '~/components/Base/UiDialog/index.vue'
import Tooltip from '~/components/Base/Tooltip/index.vue'
import type { AnswerTestState } from '~/store/answer-test'

interface State {
  buttonText?: string
  title?: string
  message?: string
  name?: string
  error?: boolean
}

export default defineComponent({
  name: 'AnswerTestIndexPage',
  components: { Button, TwoToneBg, TextField, FormLayout, UiDialog, Tooltip },
  layout: 'answer-test' as Layout,
  transition: 'answer-page-transition',
  setup(_, { root }) {
    const showAlert = ref(false)

    const loading = computed(() => {
      return (root.$store.state['answer-test'] as AnswerTestState).loading
    })

    const state = computed(() => {
      const answerTestState = root.$store.state[
        'answer-test'
      ] as AnswerTestState
      const welcomeScreen = answerTestState.form.welcomeScreen

      if (!welcomeScreen) {
        return {
          error: true,
        } as State
      }

      const { buttonText, message, title } = welcomeScreen

      return {
        buttonText,
        message,
        title,
        name: answerTestState.username,
      } as State
    })

    const exitTest = () => {
      window.location.replace('about:blank')
    }

    const beginTest: OnSubmit<{ name: string }> = async ({
      toggleLoading,
      formValues,
      refreshForm
    }) => {
      toggleLoading(true)

      const { error } = await root.$store.dispatch(
        'answer-test/beginTest',
        formValues.name
      )

      if (!error) {
        showAlert.value = false
      } else {
        refreshForm()
      }

      toggleLoading(false)
    }

    const nextStep = async () => {
      if (!state.value.name) {
        showAlert.value = true
      } else {
        // go to next step
        await root.$store.dispatch('answer-test/beginTest')
      }
    }

    return { showAlert, exitTest, beginTest, state, loading, nextStep }
  },

  head: {
    title: 'Psuedo title!!! Answer tests',
    meta: [
      {
        hid: 'description',
        name: 'descrition',
        content: 'Answer tests. Design survey',
      },
    ],
  },
})
</script>

<template>
  <div class="h-full">
    <TwoToneBg
      :loading="loading"
      right-pane-class="fade-appear pl-48 xl:pl-64 pt-144 xl:pt-198 pr-32 xl:pr-64"
    >
      <template #right>
        <h2 class="font-semibold text-[28px] leading-[24px] mb-20 font-sf-pro-display">
          {{ state.title }}
        </h2>

        <p class="mb-24 max-w-[517px]">
          {{ state.message }}
        </p>

        <p class="mb-24">
          <strong> ⏱ Estimated duration: 3 to 5 mins </strong>
        </p>

        <div class="flex items-center space-x-12">
          <Button primary @click="nextStep">
            {{ state.buttonText }}
          </Button>

          <Button plain> Learn how to give the best responses </Button>
        </div>
      </template>
    </TwoToneBg>

    <UiDialog v-model="showAlert" is-alert ma>
      <template #header>
        <div class="flex justify-start items-center">
          <Tooltip v-slot="{ events }" label="Exit test">
            <button
              type="button"
              class="outline-none focus:bg-base-critical hover:bg-base-critical border-none focus:ring-2 ring-base-critical rounded-lg ring-offset-2 p-4 group transition-all"
              v-on="events"
              @click="exitTest"
            >
              <span class="sr-only"> Exit test </span>

              <span>
                <PIcon
                  source="MobileCancelMajor"
                  class="fill-base-critical p-0 shrink-0 h-16 w-16 transition-all group-focus:fill-white group-hover:fill-white"
                />
              </span>
            </button>
          </Tooltip>

          <span
            class="shrink-0 grow font-medium text-center ml-[-20px] font-sf-pro-display"
          >
            Fill your name to continue
          </span>
        </div>
      </template>

      <FormLayout
        v-slot="{ fieldIdAndError, loading: submitting }"
        name="submit-name"
        class="lg:min-w-[450px]"
        @on-submit="beginTest"
      >
        <TextField
          v-bind="fieldIdAndError('name')"
          label="Name"
          autofocus
          help-text="Enter 2 or more characters"
          required
          pattern="^.{2,255}$"
        />

        <div class="flex items-center justify-end space-x-16 mt-32 lg:mt-32">
          <Button plain destructive @click="showAlert = false"> Cancel </Button>

          <Button type="submit" :loading="submitting" primary>
            Continue
          </Button>
        </div>
      </FormLayout>
    </UiDialog>
  </div>
</template>

<style lang="postcss"></style>
