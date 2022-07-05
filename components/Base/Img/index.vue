<script lang="ts">
import { computed, defineComponent, ref, watch } from '@vue/composition-api'
import Intersection from '../Intersection/index.vue'
import { sleep } from '~/utils'

const loadedSrc = new Map() as Map<string, number>

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
  emits: ['load:success', 'load:error', 'load', 'error'],
  setup(_props, { emit }) {
    const props = computed(() => _props)

    const loaded = ref(!!loadedSrc.get(props.value.src))

    const error = ref(false)

    watch(
      () => props.value.src,
      () => {
        loaded.value = false
        error.value = false
      }
    )

    const onError = () => {
      emit('load:error')
      
      loaded.value = false
      error.value = true
    }

    const onLoad = () => {
      sleep().then(() => {
        emit('load:success')

        loaded.value = true
        error.value = false

        loadedSrc.set(props.value.src, 1)
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
    :config="{ rootMargin: '64px' }"
    once
  >
    <figure
      class="flex-centered bg-surface-default border border-divider/30"
      :title="error ? alt : undefined"
      :aria-label="alt"
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
        class="animate-pulse w-full h-full rounded-[inherit] bg-surface-highlight-default/20"
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
    @load.native="$emit('load')"
    @error.native="$emit('error')"
  />
</template>
