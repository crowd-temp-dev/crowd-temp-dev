<script lang="ts">
import {
  ComponentInstance,
  computed,
  defineComponent,
  nextTick,
  ref,
} from '@vue/composition-api'
import UiTrapFocus from 'ui-trap-focus'
import { oneFrame, sleep } from '~/utils'

export default defineComponent({
  name: 'AnswerTestTemplatePreferenceTestItem',
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
    const expanded = ref(false)

    const overlayEntered = ref(false)

    const overlayStyles = ref({})

    const contentRef = ref<HTMLElement>(null)

    const overlayRef = ref<HTMLElement>(null)

    const expandBtnRef = ref<ComponentInstance>(null)

    const getSrc = computed(() => {
      return `/file/${_props.src}`
    })

    const imageAlt = computed(() => {
      return `Version ${_props.index} image`
    })

    const getFromStyle = () => {
      if (contentRef.value) {
        const contentBound = contentRef.value.getBoundingClientRect()

        const header = document.getElementById('app-header')

        const headerHeight = header ? header.offsetHeight : 56

        const viewPort = {
          width: innerWidth,
          height: innerHeight - headerHeight,
        }

        const overlayHeight = `${viewPort.height}px`

        const overlayTop = `${headerHeight}px`

        const scaleFromX = contentBound.width / viewPort.width

        const scaleFromY = contentBound.height / viewPort.height

        const translateX = `${contentBound.left}px`

        const translateY = `${contentBound.top - headerHeight}px`

        return {
          height: overlayHeight,
          top: overlayTop,
          visibility: 'hidden',
          borderRadius: '6.75px',
          transform: `scale3d(${scaleFromX},${scaleFromY},1) translate3d(${translateX},${translateY},0)`,
          transformOrigin: `${translateX} ${translateY}`,
        }
      }

      return {}
    }

    const openOverlay = async () => {
      if (contentRef.value) {
        const fromStyle = getFromStyle()

        overlayStyles.value = {
          ...fromStyle,
          transitionDuration: '0s',
        }

        await nextTick()

        expanded.value = true

        await sleep(oneFrame)

        overlayStyles.value = {
          height: fromStyle.height,
          top: fromStyle.top,
          borderRadius: '0px',
          transform: `scale3d(1,1,1) translate3d(0,0,0)`,
          transformOrigin: fromStyle.transformOrigin,
          transitionDuration: '250ms',
        }

        await sleep(250)

        if (overlayRef.value) {
          overlayRef.value.focus()

          overlayEntered.value = true
        }
      }
    }

    const closeOverlay = () => {
      if (contentRef.value && overlayRef.value) {
        overlayRef.value.addEventListener('transitionend', () => {
          expanded.value = false

          if (expandBtnRef.value) {
            ; (expandBtnRef.value.$el as HTMLElement).focus({
              preventScroll: true
            })
          }
        })

        overlayStyles.value = {
          ...getFromStyle(),
          visibility: '',
          transition: '200ms ease-out',
        }

        overlayEntered.value = false
      }
    }

    const trapFocus = (evt: KeyboardEvent) => {
      const trapFocus = new UiTrapFocus({
        children: 'button',
      })

      trapFocus.init(evt)
    }

    return {
      getSrc,
      imageAlt,
      expanded,
      overlayStyles,
      contentRef,
      overlayRef,
      expandBtnRef,
      overlayEntered,
      openOverlay,
      trapFocus,
      closeOverlay,
    }
  },
})
</script>

<template>
  <div>
    <div
      ref="contentRef"
      class="p-[16.86px] rounded-[6.75px] bg-surface-default shadow-card min-h-[max(37.2vh,200px)] transition-opacity"
      :class="{ 'opacity-0': expanded }"
    >
      <div class="flex items-center justify-between">
        <strong> Version {{ index }} </strong>

        <Button ref="expandBtnRef" @click="openOverlay"> Expand </Button>
      </div>

      <div
        class="my-16 w-full h-full cursor-pointer"
        @click="$emit('on-select')"
      >
        <img :src="getSrc" :alt="imageAlt" class="w-full h-240 object-contain" />
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

    <Teleport to="overlay">
      <div
        v-if="expanded"
        ref="overlayRef"
        tabindex="0"
        class="w-full fixed inset-0 outline-none bg-sky-light spring-ease"
        :style="overlayStyles"
        @keydown="trapFocus"
        @keydown.esc="closeOverlay"
      >
        <div
          class="w-full h-full duration-200"
          :class="{ 'opacity-0': !overlayEntered }"
        >
          <div class="h-76 w-full shadow-divide-header bg-surface-default">
            <div
              class="max-w-[1312px] px-20 relative flex-centered h-full mx-auto"
            >
              <strong> View the image below for this question </strong>

              <Button primary class="absolute right-0" @click="closeOverlay">
                Minimize
              </Button>
            </div>
          </div>

          <div class="flex-centered h-full w-full">
            <!-- <div class="aspect-w-16 aspect-h-6"> -->
            <img
              :src="getSrc"
              :alt="imageAlt"
              class="w-auto h-[80%] object-contain"
            />
            <!-- </div> -->
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
