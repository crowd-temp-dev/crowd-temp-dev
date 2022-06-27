<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import Section from '../Section/index.vue'
import FollowUpQuestion from '../FollowUpQuestion/index.vue'
import createTest from '~/mixins/createTest'
import { urlRegExpString } from '~/utils'
import DialogButton from '~/components/Base/DialogButton/index.vue'
import IFrame from '~/components/Base/IFrame/index.vue'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'

export default defineComponent({
  name: 'AppCreateTestStepsWebsiteEvaluation',
  components: {
    Section,
    FollowUpQuestion,
    DialogButton,
    IFrame,
    FadeTransition,
  },
  mixins: [createTest],
  setup() {
    const iframeErrorReason = ref('')

    const iframeKey = ref(0)

    const acceptUrlShareTerms = ref(false)

    const reloadIframe = () => {
      iframeErrorReason.value = ''

      iframeKey.value += 1
    }

    return {
      iframeErrorReason,
      acceptUrlShareTerms,
      reloadIframe,
    }
  },
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
    hideIframe() {
      return /^(?:sameorigin|deny)$/.test(this.iframeErrorReason)
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
            v-slot="{ events, open }"
            class="shrink-0"
            :disabled="!disablePreview && acceptUrlShareTerms"
            :label="
              disablePreview ? 'Enter a valid url' : 'Accept checkbox below'
            "
          >
            <span v-on="events" @click="open">
              <DialogButton
                label="Preview URL"
                :disable-button="disablePreview"
                :dialog-attrs="{
                  transition: 'slide-y',
                  noBodyPadding: true,
                }"
                :dialog-events="{
                  beforeEnter: () => (iframeErrorReason = ''),
                  afterLeave: () => (iframeErrorReason = ''),
                }"
                dialog-content-class="resize-x w-[min(92vw,1500px)] min-w-[320px] max-w-[min(92vw,1500px)] max-h-[min(95vh,1200px)] min-h-[min(95vh,1200px)]"
                :readonly="!acceptUrlShareTerms"
              >
                Preview URL

                <template #dialog-header>
                  <strong> Preview URL </strong>
                </template>

                <template #dialog>
                  <div class="h-full w-inherit">
                    <div class="relative w-full h-full overflow-hidden">
                      <FadeTransition>
                        <IFrame
                          v-if="!hideIframe"
                          :src="previewSrc"
                          :frame-name="`preview-url-${id}`"
                          @error-reason="(evt) => (iframeErrorReason = evt)"
                        />

                        <div
                          v-else
                          key="error-bg"
                          class="w-full h-full bg-base-critical/5 text-center content-start grid justify-center grid-rows-[auto,auto,auto,1fr,auto]"
                        >
                          <h2
                            class="text-display-large uppercase text-text-critical font-semibold font-sf-pro-display mt-64 mb-32"
                          >
                            Cannot load URL
                          </h2>

                          <p class="text-heading text-text-default/80 mb-32">
                            An error occured trying to load
                            <a
                              :href="previewSrc"
                              target="_blank"
                              rel="noreferrer noopener"
                              class="text-action-primary-default pointer-events-auto"
                              >{{ state.websiteLink }}</a
                            >
                          </p>

                          <div
                            class="font-mono text-text-subdued text-text-default/70 text-heading"
                          >
                            <p v-if="hideIframe">
                              x-frame-options in headers is set to
                              <code
                                class="bg-black/5 p-4 rounded font-medium"
                                >{{ iframeErrorReason }}</code
                              >.
                            </p>

                            <p v-else>An unknown error occured</p>
                          </div>

                          <div class="min-h-full w-full" />

                          <Button
                            primary
                            class="pointer-events-auto mb-32"
                            size="large"
                            @click="reloadIframe"
                          >
                            Retry
                          </Button>
                        </div>
                      </FadeTransition>
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
    />
  </Section>
</template>
