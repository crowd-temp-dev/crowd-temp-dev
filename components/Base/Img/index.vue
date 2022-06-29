<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import Spinner from '../Spinner/index.vue'
import { oneFrame, sleep } from '~/utils'

export default defineComponent({
  name: 'BaseImg',
  components: { Spinner },

  props: {
    src: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      required: true,
    },
  },
  emits: ['load:success', 'load:error'],
  setup(_props, { emit }) {
    const loaded = ref(false)
    const onError = () => {
      emit('load:error')
      loaded.value = false
    }
    const onLoad = () => {
      sleep(oneFrame).then(() => {
        emit('load:success')
        loaded.value = true
      })
    }
    return { loaded, onLoad, onError }
  },
})
</script>

<template>
  <div v-if="!loaded" class="flex-centered bg-surface-subdued">
    <img
      :src="src"
      :alt="alt"
      class="sr-only invisible"
      decoding="async"
      @error="onError"
      @load="onLoad"
    />

    <Spinner class="text-text-subdued text-display-large" />
  </div>

  <img
    v-else
    :src="src"
    :alt="alt"
    decoding="async"
    class="fade-appear"
    v-bind="$attrs"
    v-on="$listeners"
  />
</template>
