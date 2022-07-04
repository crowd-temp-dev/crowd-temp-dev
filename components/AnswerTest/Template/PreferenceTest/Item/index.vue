<script lang="ts">
import {
  computed,
  defineComponent,
} from '@vue/composition-api'
import FLIPContainer from '~/components/Base/FLIPContainer/index.vue'

export default defineComponent({
  name: 'AnswerTestTemplatePreferenceTestItem',
  components: { FLIPContainer },

  props: {
    index: {
      type: Number,
      required: true,
    },
    active: Boolean,
    src: {
      type: String,
      required: true,
    },
  },
  setup(_props) {
    const getSrc = computed(() => {
      return `uploads/${_props.src}`
    })
    const imageAlt = computed(() => {
      return `Version ${_props.index} image`
    })

    return {
      getSrc,
      imageAlt,
    }
  },
})
</script>

<template>
  <FLIPContainer
    view-port="main"
    content-class="bg-sky-light"
    :z-index-offset="5"
    :leave-transition="{ ease: 'ease-out' }"
  >
    <template #trigger="payload">
      <div
        ref="contentRef"
        class="p-[16.86px] rounded-[6.75px] bg-surface-default shadow-card min-h-[max(37.2vh,200px)] transition-opacity"
        :class="{ 'opacity-0': payload.active }"
      >
        <div class="flex items-center justify-between">
          <strong> Version {{ index }} </strong>

          <Button ref="expandBtnRef" @click="payload.open"> Expand </Button>
        </div>

        <div
          class="my-16 w-full h-full cursor-pointer"
          @click="$emit('on-select')"
        >
          <img
            :src="getSrc"
            :alt="imageAlt"
            class="w-full h-240 object-contain"
          />
        </div>

        <div class="flex items-center justify-between">
          <p class="text-text-subdued">Click to select</p>

          <button
            type="button"
            class="relative fill-before before:bg-action-primary-default rounded-full h-10 w-10 ring-2 ring-offset-2 before:transition-transform before:transform-gpu transition-shadow border-none"
            :class="{
              'before:scale-0 ring-border-default': !active,
              'ring-action-primary-default': active,
            }"
            @click="$emit('on-select')"
            @keydown.enter="$emit('on-select')"
          ></button>
        </div>
      </div>
    </template>

    <template #content="{ close, overlayEntered }">
      <div
        class="w-full h-full duration-200"
        :class="{ 'opacity-0': !overlayEntered }"
      >
        <div class="h-76 w-full shadow-divide-header bg-surface-default">
          <div
            class="max-w-[1312px] px-20 relative flex-centered h-full mx-auto"
          >
            <strong> View the image below for this question </strong>

            <Button primary class="absolute right-0" @click="close">
              Minimize
            </Button>
          </div>
        </div>

        <div class="flex-centered h-full w-full">
          <!-- <div class="aspect-w-16 aspect-h-6"> -->
          <Img
            :src="getSrc"
            :alt="imageAlt"
            class="w-auto h-[80%] object-contain"
          />
          <!-- </div> -->
        </div>
      </div>
    </template>
  </FLIPContainer>
</template>
