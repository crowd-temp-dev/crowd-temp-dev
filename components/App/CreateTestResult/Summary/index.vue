<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api'
import TestTypes from './TestTypes/index.vue'
import ShareResult from './ShareResult/index.vue'
import Button from '@/components/Base/Button/index.vue'
import CopyText from '~/components/Base/CopyText/index.vue'
import { generateShareLink } from '~/utils'

export default defineComponent({
  name: 'AppCreateTestResultSummary',
  components: { Button, CopyText, TestTypes, ShareResult },
  props: {
    participants: {
      type: Number,
      required: true,
    },
    responses: {
      type: Number,
      required: true,
    },
    shareLink: {
      type: String,
      required: true,
    },
  },
  setup(_props) {
    const getShareLink = computed(() => generateShareLink(_props.shareLink))

    const testType = ref(0)

    const headerStats = computed(() => {
      return [
        {
          title: 'User sessions',
          value: 0,
        },
        {
          title: 'Number of test blocks',
          value: 0,
        },
        {
          title: 'Completion rate',
          value: 0,
        },
        {
          title: 'Average duration',
          value: 0,
        },
      ]
    })

    return { getShareLink, headerStats, testType }
  },
})
</script>

<template>
  <section class="rounded-lg bg-surface-default p-20 shadow-2 w-full mb-32">
    <!-- header -->
    <div class="mb-10 grid grid-flow-col grid-cols-4 items-center">
      <template v-for="(item, i) in headerStats">
        <div :key="i" class="response-rate flex h-52 w-full">
          <div class="grow grid justify-items-center">
            <strong class="font-sf-pro-display text-[20px] leading-[32px]">
              {{ item.value }}
            </strong>

            <p class="text-text-subdued text-center">{{ item.title }}</p>
          </div>

          <hr v-if="i < headerStats.length - 1" class="h-full w-1 border-l" />
        </div>
      </template>
    </div>

    <hr class="border-b border-y-0 border-x-0 mb-20" />

    <div class="flex items-center justify-between">
      <div class="grow">
        <p class="text-body-sm">Share with your test link</p>

        <div class="flex items-center space-x-12 mt-10 w-full">
          <TextField
            class="max-w-[328px] w-full"
            readonly
            :value="getShareLink"
          >
            <template #suffix>
              <div>
                <CopyText
                  v-slot="{ copy }"
                  :text="getShareLink"
                  success-message="Link copied"
                >
                  <PIcon source="DuplicateMinor" @click="copy" />
                </CopyText>
              </div>
            </template>
          </TextField>
        </div>
      </div>

      <div class="flex items-center flex-wrap xl:flex-nowrap justify-end">
        <TestTypes v-model="testType" />

        <Button class="xl:mr-6 mb-6 xl:mb-0"> Filter results </Button>

        <div class="w-full xl:w-[initial] flex justify-end">
          <ShareResult />
        </div>
      </div>
    </div>
  </section>
</template>
