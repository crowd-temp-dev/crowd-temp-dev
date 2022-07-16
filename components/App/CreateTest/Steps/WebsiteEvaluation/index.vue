<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import Section from '../Section/index.vue'
import FollowUpQuestion from '../FollowUpQuestion/index.vue'
import PreviewURL from '../../PreviewURL/index.vue'
import createTest from '~/mixins/createTest'
import { urlRegExpString } from '~/utils'

export default defineComponent({
  name: 'AppCreateTestStepsWebsiteEvaluation',
  components: {
    Section,
    FollowUpQuestion,
    PreviewURL,
  },
  mixins: [createTest],
  setup() {
    const acceptUrlShareTerms = ref(false)

    return {
      acceptUrlShareTerms,
    }
  },
  computed: {
    disablePreview() {
      return !new RegExp(urlRegExpString, 'g').test(this.state.websiteLink)
    },
  },
})
</script>

<template>
  <Section
    :id="id"
    v-slot="{ fieldIdAndError }"
    :title="`${rootNumber}. Website evaluation`"
    :store-index="rootNumber"
  >
    <p class="mb-20">
      Add you website link, set tasks for participants to complete and add
      questions
    </p>

    <div class="grid gap-y-20 mt-0 mb-20">
      <div>
        <div
          class="flex space-x-10"
          :class="[
            fieldIdAndError(`${state.id}-link`).error
              ? 'items-center'
              : 'items-end',
          ]"
        >
          <TextField
            v-model="state.websiteLink"
            label="Website link"
            required
            class="grow"
            v-bind="fieldIdAndError(`${state.id}-link`)"
          />

          <Tooltip
            v-slot="{ events, open }"
            class="shrink-0"
            :disabled="!disablePreview && acceptUrlShareTerms"
            :label="
              disablePreview ? 'Enter a valid url' : 'Accept checkbox below'
            "
          >
            <span v-on="{ ...events, click: open }">
              <PreviewURL
                :disable-button="disablePreview"
                :readonly="!acceptUrlShareTerms"
                :preview-src="state.websiteLink"
              />
            </span>
          </Tooltip>
        </div>

        <p class="text-text-subdued mt-4">
          Kindly confirm from your website developer
          <span class="text-text-default"
            >that x-frame-options isn't set to 'sameorigin' or 'deny'</span
          >, for website to load properly. Preview URL to confirm site loads
          properly before creating your test.
          <NuxtLink class="text-action-primary-default hover:underline" to="#"
            >Learn more</NuxtLink
          >
        </p>
      </div>

      <Checkbox
        :id="`${id}-agree`"
        v-model="acceptUrlShareTerms"
        required
        label="Click check box to confirm you have permission from the website company to use this website URL in a test"
      />

      <TextField
        v-model="state.task"
        label="Task (Optional)"
        help-text="What task would you like people to complete on this prototype"
      />
    </div>

    <FollowUpQuestion
      v-model="state.followUpQuestions"
      :question-id="state.id"
      :root-number="rootNumber"
      :id-and-error="fieldIdAndError"
    />
  </Section>
</template>
