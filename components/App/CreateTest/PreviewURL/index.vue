<script lang="ts">
import { defineComponent, computed, ref } from '@vue/composition-api'
import DialogButton from '~/components/Base/DialogButton/index.vue'
import Id from '~/components/Base/Id/index.vue'
import IFrame from '~/components/Base/IFrame/index.vue'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'

export default defineComponent({
  name: 'AppCreateTestStepsWebsiteEvaluation',
  components: {
    Id,
    DialogButton,
    IFrame,
    FadeTransition,
  },
  props: {
    buttonLabel: {
      type: String,
      default: 'Preview URL',
    },
    previewSrc: {
      type: String,
      required: true,
    },
  },
  setup(_props) {
    const iframeErrorReason = ref('')

    const iframeKey = ref(0)

    const acceptUrlShareTerms = ref(false)

    const reloadIframe = () => {
      iframeErrorReason.value = ''

      iframeKey.value += 1
    }

    const hideIframe = computed(() => {
      return /^(?:sameorigin|deny)$/.test(iframeErrorReason.value)
    })

    const getPreviewSrc = computed(() => {
      return `https://${_props.previewSrc.replace(/^https?:\/\//, '')}`
    })

    return {
      iframeErrorReason,
      acceptUrlShareTerms,
      hideIframe,
      getPreviewSrc,
      reloadIframe,
    }
  },
})
</script>

<template>
  <Id v-slot="{ id }">
    <DialogButton
      :dialog-attrs="{
        transition: 'slide-y',
        noBodyPadding: true,
      }"
      :dialog-events="{
        beforeEnter: () => (iframeErrorReason = ''),
        afterLeave: () => (iframeErrorReason = ''),
      }"
      dialog-content-class="resize-x w-[min(92vw,1500px)] min-w-[320px] max-w-[min(92vw,1500px)] max-h-[min(95vh,1200px)] min-h-[min(95vh,1200px)]"
      v-bind="$attrs"
    >
      {{ buttonLabel }}

      <template #dialog-header>
        <slot name="dialog-header">
          <strong> Preview URL </strong>
        </slot>
      </template>

      <template #dialog>
        <div class="h-full w-inherit">
          <div class="relative w-full h-full overflow-hidden">
            <FadeTransition>
              <IFrame
                v-if="!hideIframe"
                :src="getPreviewSrc"
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

                <p
                  class="text-heading text-text-default/80 mb-32 max-w-[700px]"
                >
                  An error occured trying to load
                  <a
                    :href="getPreviewSrc"
                    target="_blank"
                    rel="noreferrer noopener"
                    class="text-action-primary-default pointer-events-auto"
                    >{{ previewSrc }}</a
                  >
                </p>

                <div
                  class="font-mono text-text-subdued text-text-default/70 text-heading"
                >
                  <p v-if="hideIframe">
                    x-frame-options in headers is set to
                    <code class="bg-black/5 p-4 rounded font-medium">{{
                      iframeErrorReason
                    }}</code
                    >.
                  </p>

                  <p v-else>An unknown error occured</p>
                </div>

                <div class="min-h-full w-full" />

                <Button
                  primary
                  class="pointer-events-auto mb-32 max-w-[550px] w-full justify-self-center"
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
  </Id>
</template>
