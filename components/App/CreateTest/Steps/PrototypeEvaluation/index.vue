<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import Section from '../Section/index.vue'
import FollowUpQuestion from '../FollowUpQuestion/index.vue'
import createTest from '~/mixins/createTest'
import { PrototypeEvaluation } from '~/database/models/CreateTests/PrototypeEvaluation'

export default defineComponent({
  name: 'AppCreateTestStepsPrototypeEvaluation',
  components: { Section, FollowUpQuestion },
  mixins: [createTest],
  setup() {
    const selectedFileType = ref('')

    const delayOptions = [{ label: '5 seconds', value: '5' }]

    const selectedFrameType = ref('')

    const frameTypes = [{ label: 'No frame', value: 'no-frame' }]

    const prototypeProviders = [
      { label: 'Figma', value: 'figma' },
      { label: 'Adobe', value: 'adobe', disabled: true },
      { label: 'InVision', value: 'invision', disabled: true },
      { label: 'Sketch', value: 'sketch', disabled: true },
      { label: 'Marvel', value: 'marvel', disabled: true },
    ] as {
      label: string
      value: PrototypeEvaluation['prototypeProvider'] | string
      disabled?: boolean
    }[]

    const validateLink = (
      link: string,
      prototypeProvider: PrototypeEvaluation['prototypeProvider']
    ) => {
      if (prototypeProvider === 'figma') {
        return (
          /^https:\/\/([\w.-]+\.)?figma.com\/(file|proto)\/([0-9a-zA-Z]{22,128})(?:\/.*)?$/.test(
            link
          ) || 'Invalid link'
        )
      }
      return true
    }

    return {
      delayOptions,
      selectedFileType,
      selectedFrameType,
      frameTypes,
      prototypeProviders,
      validateLink,
    }
  },
})
</script>

<template>
  <Section
    :id="id"
    v-slot="{ fieldIdAndError }"
    :title="`${rootNumber}. Prototype evaluation`"
    :store-index="rootNumber"
  >
    <p class="mb-20">
      Input your prototype link, set tasks for participants to complete and add
      questions
    </p>

    <div>
      <div class="flex space-x-8 items-end">
        <Select
          v-model="state.prototypeProvider"
          :options="prototypeProviders"
          label="Prototype link"
          class="shrink-0 min-w-[105px]"
          :class="
            fieldIdAndError(`${state.id}-link`).error
              ? 'mb-[calc(20px+0.4rem)]'
              : ''
          "
          required
        />

        <TextField
          v-model="state.prototypeLink"
          required
          v-bind="fieldIdAndError(`${state.id}-link`)"
          class="grow"
          :validate="(e) => validateLink(e, state.prototypeProvider)"
        />
      </div>

      <p class="text-text-subdued mt-4 mb-20">
        Copy the share a directly prototype link from your design file, be sure
        to enable “Anyone can view with link”.
        <NuxtLink class="text-action-primary-default hover:underline" to="#"
          >Learn more</NuxtLink
        >
      </p>
    </div>

    <TextField
      v-model="state.task"
      label="Task (Optional)"
      help-text="What task would you like people to complete on this prototype"
    />

    <FollowUpQuestion
      v-model="state.followUpQuestions"
      :question-id="state.id"
      :root-number="rootNumber"
      :id-and-error="fieldIdAndError"
    />
  </Section>
</template>
