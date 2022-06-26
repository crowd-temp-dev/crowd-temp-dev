<script lang="ts">
import { defineComponent, ref, computed, watch } from '@vue/composition-api'

type IframeErrorReason =
  | 'deny'
  | 'sameorigin'
  | 'allow'
  | 'unknown'
  | '500'
  | null

export default defineComponent({
  name: 'IFrame',
  props: {
    src: {
      type: String,
      required: true,
    },
    allowPointer: Boolean,
    iframeAttrs: {
      type: Object,
      default: () => ({}),
    },
    frameName: {
      type: String,
      required: true,
    },
  },
  emits: ['load-success', 'error-reason', 'on-fetch'],
  setup(_props, { root, emit }) {
    const iframeFetched = ref(false)

    const allowPointer = computed(() => _props.allowPointer)

    const iframeLoadSuccess = ref(_props.allowPointer)

    watch(
      () => allowPointer.value,
      (nv) => {
        if (nv) {
          iframeLoadSuccess.value = true
        }
      }
    )

    const iframeErrorReason = ref<IframeErrorReason>(null)

    const removeIFrame = computed(() => {
      return (
        iframeErrorReason.value === 'deny' ||
        iframeErrorReason.value === 'sameorigin'
      )
    })

    const onLoad = async (evt: Event) => {
      iframeFetched.value = true

      emit('on-fetch')

      iframeErrorReason.value = null

      const iframe = evt.target as HTMLIFrameElement

      const isLoaded = !!((iframe.contentWindow || {}).window || {}).length

      iframeLoadSuccess.value = isLoaded

      emit('load-success')

      // send a req to see if the src can be loaded at all
      if (!isLoaded) {
        const checkUrlFrameOptions = async (
          src: string
        ): Promise<IframeErrorReason> => {
          try {
            const res = await root.$axios.get(
              'https://header-inspector.repalash.workers.dev/?' +
                new URLSearchParams({
                  apiurl: src,
                  headers: 'x-frame-options',
                })
            )

            if (res.data) {
              const xFrameOptions = (
                (res.data.headers['x-frame-options'] as string) || ''
              ).toLowerCase()

              if (xFrameOptions === 'deny') {
                return 'deny'
              }

              if (
                xFrameOptions === 'sameorigin' &&
                res.data.origin !== location.origin
              ) {
                return 'sameorigin'
              }

              return 'allow'
            } else return 'unknown'
          } catch (err) {
            return '500'
          }
        }

        if (!_props.allowPointer) {
          const checkErrorReason = await checkUrlFrameOptions(iframe.src)

          if (checkErrorReason === '500' || checkErrorReason === 'allow') {
            iframeLoadSuccess.value = true

            emit('load-success')
          } else {
            iframeErrorReason.value = checkErrorReason            

            emit('error-reason', checkErrorReason)
          }
        } else {
          iframeLoadSuccess.value = true
        }
      }
    }

    return {
      iframeLoadSuccess,
      iframeFetched,
      removeIFrame,
      iframeErrorReason,
      onLoad,
    }
  },
})
</script>

<template>
  <div class="h-full w-full isolate">
    <slot name="prepend">
      <p
        class="h-full w-full bg-sky-light text-text-subdued font-sf-pro-display font-semibold text-display-small absolute inset-0 flex-centered -z-1"
      >
        Loading...
      </p>
    </slot>

    <iframe
      :name="frameName"
      :src="src"
      crossorigin
      class="w-full h-full block bg-sky-light"
      :class="{
        'pointer-events-auto': allowPointer,
        invisible: !iframeLoadSuccess && !allowPointer,
      }"
      v-bind="iframeAttrs"
      @load="onLoad"
    />

    <slot name="append" />
  </div>
</template>
