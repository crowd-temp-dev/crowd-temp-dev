<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api'
import Button from '@/components/Base/Button/index.vue'
import CopyText from '~/components/Base/CopyText/index.vue'
import { generateShareLink } from '~/utils'

export default defineComponent({
  name: 'AppCreateTestResultSummary',
  components: { Button, CopyText },
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

    return { getShareLink }
  },
})
</script>

<template>
  <section class="rounded-lg bg-surface-default p-20 shadow-2 w-full">
    <!-- header -->
    <div class="mb-10 flex items-center">
      <div class="response-rate mr-20">
        <strong>
          {{ participants }}
        </strong>

        <p>Participant{{ participants > 1 ? 's' : '' }}</p>
      </div>

      <div class="response-rate">
        <strong>
          {{ responses }}
        </strong>

        <p>Response{{ responses > 1 ? 's' : '' }}</p>
      </div>

      <div class="flex flex-grow justify-end flex-wrap">
        <Button plain-action disclosure="down"> All test types </Button>

        <Button class="xl:mr-6 mb-6 xl:mb-0"> Filter results </Button>

        <Button> Export results </Button>
      </div>
    </div>
    <hr class="border-b border-y-0 border-x-0 mb-20" />

    <strong class="text-heading"> Share with your test link </strong>

    <div class="flex items-center space-x-12 mt-10 w-full">
      <TextField class="max-w-[328px] w-full" readonly :value="getShareLink" />

      <CopyText
        v-slot="{ copy }"
        :text="getShareLink"
        success-message="Link copied"
      >
        <Button primary class="shrink-0" @click="copy"> Copy link </Button>
      </CopyText>
    </div>
  </section>
</template>

<style scoped lang="postcss">
.response-rate {
  @apply xl:w-[123px];
}

.response-rate > strong {
  @apply font-sf-pro-display text-[20px] leading-[32px];
}

.response-rate > p {
  @apply text-text-subdued;
}
</style>
