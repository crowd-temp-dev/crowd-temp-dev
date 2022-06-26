<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import Section from '../Section/index.vue'
import FollowUpQuestion from '../FollowUpQuestion/index.vue'
import createTest from '~/mixins/createTest'
import { urlRegExpString } from '~/utils'
import DialogButton from '~/components/Base/DialogButton/index.vue'
import IFrame from '~/components/Base/IFrame/index.vue'

export default defineComponent({
  name: 'AppCreateTestStepsWebsiteEvaluation',
  components: { Section, FollowUpQuestion, DialogButton, IFrame },
  mixins: [createTest],
  computed: {
    disablePreview() {
      return !new RegExp(urlRegExpString, 'g').test(this.state.websiteLink)
    },
    previewSrc() {
      return `https://${((this.state || {}).websiteLink || '').replace(
        /^https?:\/\//,
        ''
      )}`
    },
  },
})
</script>

<template>
  <Section
    :id="id"
    :title="`${rootNumber}. Website evaluation`"
    :store-index="rootNumber"
  >
    <p class="mb-20">
      Add you website link, set tasks for participants to complete and add
      questions
    </p>

    <div class="grid gap-y-20 mt-0 mb-20">
      <div>
        <div class="flex space-x-10 items-end">
          <TextField
            v-model="state.websiteLink"
            label="Website link"
            required
            class="grow"
          />

          <Tooltip
            v-slot="{ events }"
            class="shrink-0"
            :disabled="!disablePreview"
            label="Enter a valid url"
          >
            <span v-on="events">
              <DialogButton
                label="Preview URL"
                :disable-button="disablePreview"
                :dialog-attrs="{
                  transition: 'slide-y',
                  noBodyPadding: true,
                }"
              >
                Preview URL

                <template #dialog-header>
                  <strong> Preview URL </strong>
                </template>

                <template #dialog>
                  <div
                    class="min-w-[min(92vw,1500px)] min-h-[min(calc(95vh-72px),1200px)] h-full w-full"
                  >
                    <div class="relative w-full h-full overflow-hidden">
                      <IFrame
                        :src="previewSrc"
                        :frame-name="`preview-url-${id}`"
                      />
                    </div>
                  </div>
                </template>
              </DialogButton>
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
    />
  </Section>
</template>
