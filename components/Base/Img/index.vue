<script lang="ts">
import { computed, defineComponent, ref, watch } from '@vue/composition-api'
import Intersection from '../Intersection/index.vue'
import { oneFrame, sleep } from '~/utils'

export default defineComponent({
  name: 'BaseImg',
  components: { Intersection },

  props: {
    src: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      required: true,
    },
    loading: {
      type: String as () => 'eager' | 'lazy',
      default: 'lazy',
    },
    fetchpriority: {
      type: String as () => 'low' | 'high' | 'auto',
      default: 'high',
    },
  },
  emits: ['load:success', 'load:error'],
  setup(_props, { emit }) {
    const loaded = ref(false)

    const error = ref(false)

    const props = computed(()=>_props)

    watch(() => props.value.src, () => {
      loaded.value = false;
      error.value = false;
    })

    const onError = () => {
      emit('load:error')
      loaded.value = false
      error.value = true
    }

    const onLoad = () => {
      sleep(oneFrame).then(() => {
        emit('load:success')
        loaded.value = true
        error.value = false
      })
    }

    return { loaded, error, onLoad, onError }
  },
})
</script>

<template>
  <Intersection
    v-if="!loaded"
    v-slot="{ isIntersecting }"
    :disabled="loading === 'eager'"
    once
  >
    <figure
      class="flex-centered bg-surface-default border border-divider/30"
      :title="error ? alt : undefined"
    >
      <CldImage
        v-if="isIntersecting && !error"
        :public-id="src"
        :alt="alt"
        class="sr-only invisible"
        decoding="async"
        :fetchpriority="fetchpriority"
        @load.native="onLoad"
        @error.native="onError"
      />

      <div
        v-if="!error"
        class="animate-pulse w-full h-full rounded-[inherit] bg-surface-subdued"
      />

      <PIcon
        v-else
        source="ImageMajor"
        class="fill-icon-default w-[1.25em] h-[1.25em]"
      />
    </figure>
  </Intersection>

  <CldImage
    v-else
    :public-id="src"
    :alt="alt"
    decoding="async"
    class="fade-appear"
    :fetchpriority="fetchpriority"
    v-bind="$attrs"
    v-on="$listeners"
  />
</template>
