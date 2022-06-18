<template>
  <div>
    <div class="mb-8 flex items-center space-x-8">
      <h3 class="text-[16px] leading-[19.09px] font-semibold">
        Question {{ numbering }}
      </h3>

      <PBadge class="bg-surface-highlight-default" size="small">
        {{ type }}
      </PBadge>
    </div>

    <p class="mb-20">The question asked should show here</p>

    <div class="flex items-center justify-between space-x-12">
      <SearchField
        placeholder="Search responses"
        outlined
        class="max-w-[270px] w-full shrink-0"
      />

      <div
        class="flex items-center justify-end space-x-6 w-full flex-wrap space-y-6 xl:space-y-0"
      >
        <!-- <select field> -->
        <div class="relative isolate shrink-0 w-full max-w-[194px]">
          <div class="isolate">
            <Select
              :options="[{ label: 'Participants', value: 'participants' }]"
            />
          </div>

          <div
            class="absolute bg-surface-default h-[calc(100%-2px)] top-1 z-10 left-1 rounded-lg py-[0.5rem] pr-[0.8rem] pl-[1.2rem] flex items-center"
          >
            <span class="text-text-subdued"> Show by </span>

            &nbsp;Participants
          </div>
        </div>
        <!-- </select-field> -->

        <Button> Filter results </Button>

        <Button icon="StarFilledMinor"> Starred </Button>
      </div>
    </div>

    <div
      class="bg-action-primary-disabled px-10 h-40 rounded-[3px] w-full my-20 flex items-center"
    >
      <strong class="text-text-subdued"> No response yet </strong>
    </div>

    <hr />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import Button from '~/components/Base/Button/index.vue'
import SearchField from '~/components/Base/SearchField/index.vue'

type Type = 'Short text' | 'Multichoice'

type Numbering = `${number}${string}`

export default defineComponent({
  name: 'AppCreateTestResultsDesignSurveyQuestion',
  components: { Button, SearchField },
  props: {
    type: {
      type: String as () => Type,
      default: 'Short text',
    },
    numbering: {
      type: String as () => Numbering,
      required: true,
    },
  },
  setup() {},
})
</script>

<style scoped></style>
