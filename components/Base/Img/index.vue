<script lang="ts">
import { computed, defineComponent, ref, watch } from '@vue/composition-api'
import Intersection from '../Intersection/index.vue'
import Tooltip from '../Tooltip/index.vue'
import { sleep } from '~/utils'

const loadedSrc = new Map() as Map<string, number>

export default defineComponent({
  name: 'BaseImg',
  components: { Intersection, Tooltip },

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
    hideReloadIcon: Boolean,
  },
  emits: ['load:success', 'load:error', 'load', 'error'],
  setup(_props, { emit }) {
    const props = computed(() => _props)

    const loaded = ref(!!loadedSrc.get(props.value.src))

    const error = ref(false)

    const reload = () => {
      loaded.value = false
      error.value = false
    }

    watch(() => props.value.src, reload)

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

    return { loaded, error, onLoad, onError, reload }
  },
})
</script>

<template>
  <Intersection
    v-if="!loaded"
    v-slot="{ isIntersecting }"
    :disabled="loading === 'eager'"
    :config="{ rootMargin: '96px' }"
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
        class="animate-pulse w-full h-full rounded-[inherit] bg-decorative-surface-five/30"
      />

      <Id v-else v-slot="{ id }">
        <label
          :for="id"
          class="group relative w-full h-full flex-centered rounded-[inherit]"
        >
          <PIcon
            source="ImageMajor"
            class="fill-icon-default w-[1.25em] h-[1.25em] group-hover:opacity-0"
          />

          <div
            class="absolute inset-0 z-1 hidden group-hover:flex justify-center items-center"
          >
            <Tooltip
              v-if="!hideReloadIcon"
              v-slot="{ events }"
              label="Reload"
              title=""
              trigger-class="flex-centered"
              open-delay="500"
            >
              <button
                :id="id"
                class="outline-none"
                v-on="events"
                @click.stop="reload"
              >
                <PIcon
                  source="RefreshMajor"
                  class="fill-icon-default w-[1.25em] h-[1.25em] cursor-pointer"
                />
              </button>
            </Tooltip>
          </div>
        </label>
      </Id>
    </figure>
  </Intersection>

  <CldImage
    v-else
    :public-id="src"
    :alt="alt"
    decoding="async"
    class="fade-appear"
    :fetchpriority="fetchpriority"
    :draggable="$attrs.draggable || 'false'"
    v-bind="$attrs"
    v-on="$listeners"
    @load.native="
      () => {
        $emit('load:success')
        $emit('load')
      }
    "
    @error.native="
      () => {
        $emit('load:error')
        $emit('error')
      }
    "
  />
</template>
