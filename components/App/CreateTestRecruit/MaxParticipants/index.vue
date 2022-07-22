<script lang="ts">
import { defineComponent, nextTick, ref, watch } from '@vue/composition-api'
import LabelSwitch from '@/components/App/CreateTest/Steps/Switch/index.vue'
import NumberField from '~/components/Base/NumberField/index.vue'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'

export default defineComponent({
  name: 'AppCreateTestRecruitMaxParticpants',
  components: {
    LabelSwitch,
    NumberField,
    FadeTransition,
  },
  props: {
    testPublished: Boolean,
    participants: {
      type: Number,
      default: 1,
    },
  },
  setup(_props) {
    const switchedOn = ref(false)

    const loading = ref(false)

    const autofocusMaxParticipants = ref(false)

    const showSaveActions = ref(false)

    const getParticipants = ref(_props.participants || 0)

    const switchToggled = (val: boolean) => {
      autofocusMaxParticipants.value = val

      showSaveActions.value = val

      switchedOn.value = val
    }

    const cancelEdit = async () => {
      showSaveActions.value = false

      await nextTick()

      if (
        typeof getParticipants.value === 'undefined' ||
        getParticipants.value === _props.participants
      ) {
        switchedOn.value = false
      } else {
        getParticipants.value = _props.participants || 1
      }
    }

    watch(
      () => getParticipants.value,
      (nv) => {
        if (nv !== _props.participants) {
          showSaveActions.value = true
        }
      }
    )

    return {
      loading,
      switchedOn,
      autofocusMaxParticipants,
      showSaveActions,
      getParticipants,
      switchToggled,
      cancelEdit,
    }
  },
})
</script>

<template>
  <li>
    <LabelSwitch
      :model-value="switchedOn"
      class="w-full grid grid-flow-col"
      :class="{
        'justify-between': testPublished,
        'justify-center': !testPublished,
      }"
      :show-switch="testPublished"
      label="Limit number of participants"
      :loading="loading"
      @update:modelValue="switchToggled"
    >
      <div
        class="normal-case font-normal text-display-small-sm flex items-center w-fit"
      >
        Limit number of participants
      </div>
    </LabelSwitch>

    <div
      v-if="switchedOn"
      class="py-10 bg-surface-subdued grid justify-items-end mt-10"
    >
      <div class="flex items-center mb-4 relative">
        <Id v-slot="{ id }">
          <div
            class="flex items-center space-x-8 transform-gpu transition-transform"
            :class="{ 'translate-x-[-72px]': showSaveActions }"
          >
            <label
              :for="id"
              class="uppercase text-sub-heading text-text-subdued font-semibold cursor-pointer"
            >
              Max number of participants
            </label>

            <NumberField
              :id="id"
              v-model="getParticipants"
              type="number"
              min="1"
              class="w-92"
              :autofocus="autofocusMaxParticipants"
            />
          </div>
        </Id>

        <FadeTransition>
          <div
            v-if="showSaveActions"
            class="flex items-center space-x-4 absolute right-0"
          >
            <Button
              icon="TickMinor"
              plain
              class="fill-icon text-text-success"
            />

            <Button
              icon="CancelSmallMinor"
              plain
              destructive
              class="fill-icon text-text-critical"
              @click="cancelEdit"
            />
          </div>
        </FadeTransition>
      </div>

      <p class="text-text-subdued">
        After 100 participants/user sessions you'll stop accepting responses
      </p>
    </div>
  </li>
</template>
