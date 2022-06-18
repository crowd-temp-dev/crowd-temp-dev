<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api'
import LabelSwitch from '@/components/App/CreateTest/Steps/Switch/index.vue'
import Button from '@/components/Base/Button/index.vue'
import FadeTransition from '@/components/Base/FadeTransition/index.vue'
import { splitPath } from '~/utils'
import { dynamicPageTransition } from '~/utils/pageTransition'
import { CreateTestState } from '~/store/create-test'
import copyText from '~/utils/copyText'

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
      if (splitFrom[1]) {
        return 'page-transition-slide-left'
      }
      return 'page-transition-slide-right'
    }

    return dynamicPageTransition({
      to,
      from,
    })
  },

  setup(_, { root }) {
    const testState = computed(() => {
      return root.$store.state['create-test'] as CreateTestState
    })

    const testDetails = computed(() => {
      return testState.value.details
    })

    const updateFeatureSwitch = async (
      index: number,
      value: Record<string, boolean>
    ) => {
      features.value[index].loading = true

      await root.$store.dispatch('create-test/updateTestDetails', value)

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

    const getShareLink = computed(() => {
      if (!testDetails.value.shareLink) {
        return ''
      }

      return `${location.origin}/answer-test/${testDetails.value.shareLink}/`
    })

    const copyLink = async () => {
      if (!getShareLink.value) {
        root.$nuxt.error({
          message: 'Oops! an error occured',
          statusCode: 500,
        })
      }

      await copyText({
        text: getShareLink.value,
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
      copyLink,
      updateFeatureSwitch,
      featureState,
      getShareLink,
    }
  },

  fetch({ store, route }) {
    store.dispatch('create-test/setId', route.params.id).then(() => {
      store.dispatch('create-test/getRecruit')
    })
  },
})
</script>

<template>
  <div class="mt-32 pb-112 px-64">
    <div
      class="p-20 rounded-lg bg-surface-default max-w-[800px] mx-auto shadow-2"
    >
      <h3 class="text-heading font-semibold text-center">
        Share with your audience
      </h3>

      <h4 class="text-center mt-8" :class="{ 'mb-20': !testDetails.published }">
        Get a unique test link and share to your audience
      </h4>

      <FadeTransition>
        <div
          v-if="testDetails.published"
          class="grid justify-center justify-items-center mb-20"
        >
          <h5 class="text-text-subdued text-[13px] leading-[20px] my-10">
            You have {{ 0 }} response{{ '' }}
            <!-- You have (0 | 1) response, You have 2 responses -->
          </h5>

          <div class="flex items-center space-x-12">
            <TextField
              class="max-w-[328px]"
              :value="getShareLink"
              readonly
              select-on-mount
            />

            <Button @click="copyLink"> Copy link </Button>
          </div>
        </div>
      </FadeTransition>

      <FadeTransition>
        <ul
          :key="`${testDetails.published}-ul`"
          class="mx-auto grid space-y-8 mb-24"
          :style="{ '--fade-leave-duration': '1ms' }"
        >
          <template v-for="(feature, i) in features">
            <li
              v-if="testDetails.published ? true : i !== 1"
              :key="feature.title"
            >
              <LabelSwitch
                :model-value="featureState[i] || false"
                class="w-full grid grid-flow-col"
                :class="{
                  'justify-between': testDetails.published,
                  'justify-center': !testDetails.published,
                }"
                :show-switch="testDetails.published"
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
          <Button v-if="testDetails.published" primary> View Results </Button>

          <Button
            v-else
            primary
            :loading="testState.publishing"
            @click="$store.dispatch('create-test/publish')"
          >
            Get sharable link
          </Button>
        </FadeTransition>
      </div>

      <div class="flex justify-center">
        <FadeTransition>
          <p v-if="testDetails.published" class="flex items-center mt-40">
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
