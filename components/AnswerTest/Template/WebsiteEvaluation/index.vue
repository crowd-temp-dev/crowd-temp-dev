<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api'
import EvaluationDialog from '../EvaluationDialog/index.vue'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'
import IFrame from '~/components/Base/IFrame/index.vue'

type IframeErrorReason = 'deny' | 'sameorigin' | 'allow' | 'unknown' | '500'

export default defineComponent({
  name: 'AnswerTestTemplateWebsiteEvaluation',
  components: { EvaluationDialog, FadeTransition, IFrame },
  setup(_, { root }) {
    const iframeFetched = ref(false)

    const iframeLoadSuccess = ref(false)

    const iframeErrorReason = ref<IframeErrorReason>(null)

    const iframeKey = ref(0)

    const dialogEntered = ref(false)

    const draggingDialog = ref(false)

    const removeIFrame = computed(() => {
      return (
        iframeErrorReason.value === 'deny' ||
        iframeErrorReason.value === 'sameorigin'
      )
    })

    const onLoad = async (evt: Event) => {
      iframeFetched.value = true

      iframeErrorReason.value = null

      const iframe = evt.target as HTMLIFrameElement

      const isLoaded = !!iframe.contentWindow.window.length

      iframeLoadSuccess.value = isLoaded

      // send a req to see if the src can be loaded at all
      if (!isLoaded) {
        const checkUrlFrameOptions = async (
          src: string
        ): Promise<IframeErrorReason> => {
          try {
            const res = await root.$axios.get(
              'https://header-inspector.repalash.workers.dev/?' +
                new URLSearchParams({
                  apiurl: src,
                  headers: 'x-frame-options',
                })
            )

            if (res.data) {
              const xFrameOptions = (
                (res.data.headers['x-frame-options'] as string) || ''
              ).toLowerCase()

              if (xFrameOptions === 'deny') {
                return 'deny'
              }

              if (
                xFrameOptions === 'sameorigin' &&
                res.data.origin !== location.origin
              ) {
                return 'sameorigin'
              }

              return 'allow'
            } else return 'unknown'
          } catch (err) {
            return '500'
          }
        }

        const checkErrorReason = await checkUrlFrameOptions(iframe.src)

        if (checkErrorReason === '500' || checkErrorReason === 'allow') {
          iframeLoadSuccess.value = true
        } else {
          iframeErrorReason.value = checkErrorReason
        }
      }
    }

    const questionIndex = computed(() =>
      parseFloat(root.$route.params.question)
    )

    const currentSection = computed(() => {
      return (
        root.$store.state['answer-test'].form[
          `question-${questionIndex.value}`
        ] || {}
      )
    })

    const websiteLink = computed(() => {
      return `https://${(currentSection.value.websiteLink || '').replace(
        /^https?:\/\//,
        ''
      )}`
    })

    const reloadIframe = () => {
      iframeFetched.value = false

      iframeLoadSuccess.value = false

      iframeErrorReason.value = null

      iframeKey.value += 1
    }

    return {
      iframeLoadSuccess,
      iframeFetched,
      removeIFrame,
      iframeErrorReason,
      currentSection,
      websiteLink,
      iframeKey,
      dialogEntered,
      draggingDialog,
      onLoad,
      reloadIframe,
    }
  },
})
</script>

<template>
  <div class="relative isolate h-full">
    <div
      class="h-76 w-full shadow-divide-header relative z-1 font-sf-pro-display font-semibold leading-[32px] text-[20px] flex-centered"
    >
      {{
        currentSection.task ||
        'Explore the website below and answer the follow-up questions'
      }}
    </div>

    <div class="max-h-full overflow-auto h-[calc(100%-76px)]">
      <div class="w-full h-full pointer-events-none relative pt-8">
        <IFrame
          :src="websiteLink"
          :allow-pointer="dialogEntered && !draggingDialog"
          frame-name="website-evaluation"
          @load-success="iframeLoadSuccess = true"
          @error-reason="evt = iframeErrorReason = evt"
          @on-fetch="iframeFetched = true"
        />

        <!-- loader and error -->
        <FadeTransition>
          <div
            v-if="!iframeFetched"
            class="pseudo z-10 flex-centered text-[44px] text-text-subdued bg-sky-light"
          >
            <p
              class="text-text-subdued font-sf-pro-display font-semibold text-display-small"
            >
              Loading...
            </p>
          </div>

          <div
            v-else-if="!iframeLoadSuccess"
            key="error-bg"
            class="w-full h-full bg-base-critical/5 text-center content-start grid justify-center grid-rows-[auto,auto,auto,1fr,auto]"
          >
            <h2
              class="text-display-x-large uppercase text-text-critical font-semibold font-sf-pro-display mt-64 mb-44"
            >
              Cannot load URL
            </h2>

            <p class="text-display-small text-text-default/80 mb-32">
              An error occured trying to load
              <a
                :href="websiteLink"
                target="_blank"
                rel="noreferrer noopener"
                class="text-action-primary-default pointer-events-auto"
                >{{ currentSection.websiteLink }}</a
              >
            </p>

            <div
              class="font-mono text-text-subdued text-text-default/70 text-heading"
            >
              <p v-if="removeIFrame">
                x-frame-options in headers is set to
                <code class="bg-black/5 p-4 rounded font-medium">{{
                  iframeErrorReason
                }}</code
                >.
              </p>

              <p v-else>An unknown error occured</p>
            </div>

            <div class="min-h-full w-full" />

            <div class="grid gap-y-20 mb-44">
              <Button
                v-if="!removeIFrame"
                primary
                class="pointer-events-auto"
                size="large"
                @click="reloadIframe"
              >
                Retry
              </Button>

              <Button class="pointer-events-auto" size="large">
                Skip section
              </Button>
            </div>
          </div>
        </FadeTransition>

        <Transition
          enter-class="translate-x-100 opacity-0"
          leave-to-class="opacity-0"
          @after-enter="dialogEntered = true"
          @before-leave="dialogEntered = false"
        >
          <EvaluationDialog
            v-if="iframeLoadSuccess"
            class="transition-[transform,opacity] ease-spring transform-gpu absolute right-0 top-0 delay-200"
            @drag-start="draggingDialog = true"
            @drag-end="draggingDialog = false"
          />
        </Transition>
      </div>
    </div>
  </div>
</template>
