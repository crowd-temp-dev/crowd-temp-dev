<script lang="ts">
import { computed, defineComponent, ref, nextTick } from '@vue/composition-api'
import LabelSwitch from '@/components/App/CreateTest/Steps/Switch/index.vue'
import Button from '@/components/Base/Button/index.vue'
import FadeTransition from '@/components/Base/FadeTransition/index.vue'
import { generateShareLink, splitPath } from '~/utils'
import { dynamicPageTransition } from '~/utils/pageTransition'
import copyText from '~/utils/copyText'
import { RootState } from '~/store'

interface Feature {
  title: string
  locked?: boolean
  active?: boolean
  loading?: boolean
  toggle?: (val: boolean) => Promise<void>
}

export default defineComponent({
  name: 'AppCreateTestRecruitPage',
  components: { LabelSwitch, Button, FadeTransition },

  transition: (to, from) => {
    const splitFrom = splitPath(from?.path || '')

    if (splitFrom[0] === 'create-test') {
      if (splitFrom[1] === 'view-result') {
        return 'page-transition-slide-right'
      }
      return 'page-transition-slide-left'
    }

    return dynamicPageTransition({
      to,
      from,
    })
  },

  setup(_, { root }) {
    const testState = computed(() => {
      return (root.$store.state as RootState).testSuite
    })

    const testDetails = computed(() => {
      return testState.value.recruit
    })

    const updateFeatureSwitch = async (
      index: number,
      value: Record<string, boolean>
    ) => {
      features.value[index].loading = true

      await root.$store.dispatch('testSuite/recruit/update', value)

      features.value[index].loading = false

      root.$nextTick(() => {
        features.value[index].active =
          testDetails.value[
            Object.keys(value)[0] as
              | 'stopAcceptingResponse'
              | 'unlimitedInvites'
          ]
      })
    }

    const featureState = computed(() => [
      testDetails.value.unlimitedInvites,
      testDetails.value.stopAcceptingResponse,
    ])

    const features = ref<Feature[]>([
      {
        title: 'Unlimited invites',
        loading: false,
        toggle: async (val) => {
          await updateFeatureSwitch(0, {
            unlimitedInvites: val,
          })
        },
      },
      {
        title: 'Stop accepting responses',
        loading: false,
        toggle: async (val) => {
          await updateFeatureSwitch(1, {
            stopAcceptingResponse: val,
          })
        },
      },
      {
        title: 'Survey demographics',
        locked: true,
      },
      {
        title: 'Re-direct after tests',
        locked: true,
      },
      {
        title: 'Custom branding',
        locked: true,
      },
      {
        title: 'Session recordings',
        locked: true,
      },
    ])

    const getFullShareLink = computed(() => {
      if (!testState.value.detail.shareLink) {
        return ''
      }

      return generateShareLink(testState.value.detail.shareLink)
    })

    const testPublished = computed(() => testState.value.detail.published)

    const testId = computed(() => testState.value.detail.id)

    const fetching = computed(() => testState.value.recruit.loading)

    const testResponses = computed(() => testState.value.detail.responses)

    const copyLink = async () => {
      if (!getFullShareLink.value) {
        root.$nuxt.error({
          message: 'Oops! an error occured',
          statusCode: 500,
        })
      }

      await copyText({
        text: getFullShareLink.value,
        onError: () => {
          root.$pToast.open({
            message: 'Error copying',
            error: true,
          })
        },
        onSuccess: () => {
          root.$pToast.open({
            message: 'Link copied',
          })
        },
      })
    }

    return {
      features,
      testDetails,
      testState,
      featureState,
      testId,
      getFullShareLink,
      testPublished,
      fetching,
      testResponses,
      copyLink,
      updateFeatureSwitch,
    }
  },

  fetch({ store, route }) {
    nextTick(() => {
      store.dispatch('testSuite/detail/setId', route.params.id).then(() => {
        store.dispatch('testSuite/recruit/fetch')
      })
    })
  },
})
</script>

<template>
  <div class="mt-32 pb-112 px-64">
    <div
      v-if="fetching"
      class="flex-centered h-full w-full text-text-subdued text-display-large min-h-[300px]"
    >
      <Spinner />
    </div>

    <div
      v-else
      class="p-20 rounded-lg bg-surface-default max-w-[800px] mx-auto shadow-2"
    >
      <h3 class="text-heading font-semibold text-center">
        Share with your audience
      </h3>

      <h4 class="text-center mt-8" :class="{ 'mb-20': !testPublished }">
        Get a unique test link and share to your audience
      </h4>

      <FadeTransition>
        <div
          v-if="testPublished"
          class="grid justify-center justify-items-center mb-20"
        >
          <h5 class="text-text-subdued text-[13px] leading-[20px] my-10">
            You have {{ testResponses || 0 }} response{{
              testResponses > 1 ? 's' : ''
            }}
          </h5>

          <div class="flex items-center space-x-12">
            <TextField
              class="max-w-[328px]"
              :value="getFullShareLink"
              readonly
              select-on-mount
            />

            <Button @click="copyLink"> Copy link </Button>
          </div>
        </div>
      </FadeTransition>

      <FadeTransition>
        <ul
          :key="`${testPublished}-ul`"
          class="mx-auto grid space-y-8 mb-24"
          :style="{ '--fade-leave-duration': '1ms' }"
        >
          <template v-for="(feature, i) in features">
            <li v-if="testPublished ? true : i !== 1" :key="feature.title">
              <LabelSwitch
                :model-value="featureState[i] || false"
                class="w-full grid grid-flow-col"
                :class="{
                  'justify-between': testPublished,
                  'justify-center': !testPublished,
                }"
                :show-switch="testPublished"
                :label="feature.title"
                :disabled="feature.locked"
                :loading="feature.loading"
                v-on="
                  feature.locked
                    ? {}
                    : {
                        'update:modelValue': feature.toggle,
                      }
                "
              >
                <div
                  class="normal-case font-normal text-display-small-sm flex items-center w-fit"
                >
                  {{ feature.title }}

                  <PIcon
                    v-if="feature.locked"
                    source="LockMinor"
                    class="fill-icon-default ml-14"
                  />
                </div>
              </LabelSwitch>
            </li>
          </template>
        </ul>
      </FadeTransition>

      <div class="flex justify-center">
        <FadeTransition>
          <Button
            v-if="testPublished"
            primary
            :to="`/create-test/view-result/${testId}`"
          >
            View Results
          </Button>

          <Button
            v-else
            primary
            :loading="testState.publishing"
            @click="$store.dispatch('testSuite/recruit/publish')"
          >
            Get sharable link
          </Button>
        </FadeTransition>
      </div>

      <div class="flex justify-center">
        <FadeTransition>
          <p v-if="testPublished" class="flex items-center mt-40">
            <PIcon source="InfoMinor" class="fill-icon-highlight mr-10" />

            Learn more about
            <a
              href="#"
              target="_blank"
              rel="noopener"
              class="text-interactive-default flex items-center"
            >
              &nbsp;Sharing links to audience.
              <PIcon
                source="ExternalSmallMinor"
                class="fill-interactive-default"
              />
            </a>
          </p>
        </FadeTransition>
      </div>
    </div>
  </div>
</template>
