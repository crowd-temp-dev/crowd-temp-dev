<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import Section from '../Section/index.vue'
import FollowUpQuestion from '../FollowUpQuestion/index.vue'
import SortableSection from './SortableSection/index.vue'
import project from '~/mixins/project'

export default defineComponent({
  name: 'AppProjectStepsCardSorting',
  components: { Section, SortableSection, FollowUpQuestion },
  mixins: [project],
})
</script>

<template>
  <Section
    :id="id"
    v-slot="{ fieldIdAndError }"
    :title="`${rootNumber}. Card Sorting`"
    :store-index="rootNumber"
  >
    <p class="mb-20">
      Card sorting helps you plan and evaluate the information architecture of
      your website.
    </p>

    <TextField
      v-model="state.task"
      label="Task"
      help-text="Add an instruction for click test e.g where would you click to sign up"
      class="my-20"
      required
      v-bind="fieldIdAndError(`${state.id}-task`)"
    />

    <SortableSection
      v-model="state.cards"
      action-text="Add new card"
      title="Cards"
      tooltip-content="Add cards of different topics to be organized into their supposed category.<br>Eg Phone, Shoes, Salad, etc"
      :id-and-error="fieldIdAndError"
    />

    <SortableSection
      v-model="state.categories"
      action-text="Add new category"
      title="Categories"
      tooltip-content="Add different categories to hold where each card belongs.<br>Eg Gadget, Clothing, Food, etc"
      :id-and-error="fieldIdAndError"
    />

    <FollowUpQuestion
      v-model="state.followUpQuestions"
      :question-id="state.id"
      :root-number="rootNumber"
      class="mt-[-20px]"
      :min-length="0"
      :id-and-error="fieldIdAndError"
    />
  </Section>
</template>
