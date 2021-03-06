<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api'
import QuestionSection from '../QuestionSection/index.vue'
import Question from '../Question/index.vue'
import viewResultProjectType from '~/mixins/view-result-project-type'
import DialogButton from '~/components/Base/DialogButton/index.vue'
import { RootState } from '~/store'

export default defineComponent({
  name: 'AppProjectResultDesignSurvey',
  components: { Question, QuestionSection, DialogButton },
  mixins: [viewResultProjectType],
  setup(_props, { root }) {
    const props = computed(() => _props as Record<string, any>)

    const sectionTitle = computed(() => {
      return `${props.value.numbering}. Design Survey`
    })

    const mediaFile = computed(() => {
      const file = (root.$store.state as RootState).projectSuite.viewResult
        .questions[`question-${props.value.numbering}`].file

      return {
        src: `uploads/${file}`,
        alt: `${sectionTitle.value} media file`,
      }
    })

    return { mediaFile, sectionTitle }
  },
})
</script>

<template>
  <QuestionSection :title="sectionTitle">
    <template #header-action>
      <DialogButton
        plain
        :dialog-attrs="{ noBodyPadding: true, transition: 'slide-y-reverse' }"
      >
        <span> View media file </span>

        <template #dialog-header>
          <strong> {{ sectionTitle }} </strong>
        </template>

        <template #dialog>
          <div class="w-[700px] h-[500px]">
            <Img
              tabindex="0"
              :src="mediaFile.src"
              :alt="mediaFile.alt"
              class="outline-none w-full h-full object-contain"
            />
          </div>
        </template>
      </DialogButton>
    </template>

    <Question
      v-for="(question, index) in followUpQuestions"
      :key="index"
      :numbering="`${numbering}${getAlphabets(index)}`"
    />
  </QuestionSection>
</template>
