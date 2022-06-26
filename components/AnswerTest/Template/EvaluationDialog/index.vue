<script lang="ts">
import {
  defineComponent,
  nextTick,
  onBeforeUnmount,
  ref,
} from '@vue/composition-api'
import { sleep } from '~/utils'
import InputField from '~/components/AnswerTest/InputField/index.vue'
import AnswerTestPageTransition from '~/components/Base/AnswerTestPageTransition/index.vue'

export default defineComponent({
  name: 'WebsiteEvaluationDialog',
  components: { InputField, AnswerTestPageTransition },
  emits: ['drag-start', 'drag-end'],
  setup(_, { emit }) {
    const viewboxRef = ref<HTMLElement>(null)
    const contentRef = ref<HTMLElement>(null)
    const isCollapsed = ref(false)
    const collapseRef = ref<HTMLElement>(null)
    const collapseStyles = ref({})
    const viewBox = ref({
      width: 0,
      height: 0,
    })

    const pos1 = ref(0)
    const pos2 = ref(0)
    const pos3 = ref(0)
    const pos4 = ref(0)

    const elementDrag = (evt: MouseEvent) => {
      if (contentRef.value) {
        const el = contentRef.value

        // evt.preventDefault()
        // calculate the new cursor position:
        pos1.value = pos3.value - evt.clientX
        pos2.value = pos4.value - evt.clientY
        pos3.value = evt.clientX
        pos4.value = evt.clientY

        const topPosition = Math.min(
          Math.max(el.offsetTop - pos2.value, 4),
          viewBox.value.height - 4
        )

        const rightPosition =
          viewBox.value.width -
          Math.max(
            Math.min(el.offsetLeft - pos1.value, viewBox.value.width - 8),
            8
          )

        // set the element's new position:
        el.style.top = `${topPosition}px`

        el.style.right = `${rightPosition}px`
      }
    }

    const removeDocumentMouseEvents = () => {
      document.removeEventListener('mousemove', elementDrag)

      document.removeEventListener('mouseup', closeDragElement)
    }

    const closeDragElement = () => {
      removeDocumentMouseEvents()

      emit('drag-end')
    }

    const dragMouseDown = (evt: MouseEvent) => {
      evt.preventDefault()

      emit('drag-start')

      viewBox.value.width =
        viewboxRef.value.clientWidth -
        (evt.currentTarget as HTMLElement).clientWidth

      viewBox.value.height =
        viewboxRef.value.clientHeight -
        (evt.currentTarget as HTMLElement).clientHeight

      // get the mouse cursor position at startup:
      pos3.value = evt.clientX
      pos4.value = evt.clientY

      document.addEventListener('mousemove', elementDrag, {
        passive: true,
      })

      document.addEventListener('mouseup', closeDragElement, {
        once: true,
      })
    }

    const toggleCollapse = async () => {
      if (collapseRef.value) {
        if (!isCollapsed.value) {
          collapseStyles.value = {
            height: `${collapseRef.value.clientHeight}px`,
          }

          await sleep()

          collapseStyles.value = {
            height: '0',
            opacity: '0',
            trasnform: 'translateZ(0)',
            overflowY: 'hidden',
          }

          await sleep(150)

          if (isCollapsed.value) {
            collapseStyles.value = {}
          }
        } else {
          collapseStyles.value = {
            visibility: 'hidden',
            height: 'auto',
          }

          await nextTick()

          const contentHeight = collapseRef.value.clientHeight + 20

          collapseStyles.value = {
            visibility: 'hidden',
            height: '0',
            opacity: '0',
          }

          requestAnimationFrame(async () => {
            collapseStyles.value = {
              height: `${contentHeight}px`,
              trasnform: 'translateZ(0)',
              overflow: 'hidden',
            }

            await sleep(150)

            if (!isCollapsed.value) {
              collapseStyles.value = {}

              const contentHeight = contentRef.value.clientHeight

              const viewBoxHeight =
                viewboxRef.value.clientHeight - contentHeight - 4

              contentRef.value.style.top = `${Math.min(
                parseFloat(contentRef.value.style.top),
                viewBoxHeight
              )}px`
            }
          })
        }
        isCollapsed.value = !isCollapsed.value
      }
    }

    onBeforeUnmount(removeDocumentMouseEvents)

    return {
      contentRef,
      viewboxRef,
      collapseRef,
      collapseStyles,
      isCollapsed,
      toggleCollapse,
      dragMouseDown,
    }
  },
})
</script>

<template>
  <div ref="viewboxRef" class="absolute inset-0 pointer-events-none h-full">
    <div
      ref="contentRef"
      class="bg-surface-default shadow-5 absolute z-10 top-4 right-8 pointer-events-auto lg:min-w-[612px] min-w-full"
      v-on="$breakpoint.isMobile ? {} : { mousedown: dragMouseDown }"
    >
      <div
        class="cursor-move text-display-small font-sf-pro-display flex items-center justify-between w-full border-b border-divider h-68 px-20"
      >
        <p class="grow">Answer the following questions</p>

        <button
          class="outline-none border-none flex-centered rounded ring-action-primary-default focus:ring-2 ring-offset-1"
          @mousedown.stop
          @click="toggleCollapse"
        >
          <PIcon
            :source="isCollapsed ? 'MinimizeMajor' : 'MaximizeMajor'"
            class="fill-icon-default shrink-0"
          />
        </button>
      </div>

      <div
        ref="collapseRef"
        class="transition-[height,opacity,transform]"
        :style="collapseStyles"
      >
        <AnswerTestPageTransition>
          <div :key="$route.fullPath" class="mt-20" @mousedown.stop>
            <InputField
              class="!px-0"
              content-class="px-20"
              title-class="font-semibold mb-[0.5rem] px-20"
              question-title-class="px-20"
            >
              <template #action="{ skipQuestion, loading, skipping }">
                <div
                  class="flex items-center justify-end space-x-16 w-full border-t border-divider h-68 px-20"
                  @mousedown.stop
                >
                  <Button primary type="submit" :loading="loading">
                    Continue
                  </Button>

                  <Button :loading="skipping" @click="skipQuestion">
                    Skip
                  </Button>
                </div>
              </template>
            </InputField>
          </div>
        </AnswerTestPageTransition>
      </div>
    </div>
  </div>
</template>
