<script lang="ts">
import { computed, defineComponent, nextTick, ref } from '@vue/composition-api'
import SmoothDrag from '@/components/Base/SmoothDrag/index.vue'
import Button from '~/components/Base/Button/index.vue'
import {
  scrollMain,
  layoutSizing,
  sleep,
  getTestFeatureTitle,
  getFeature,
} from '~/utils'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'
import Tooltip from '~/components/Base/Tooltip/index.vue'
import { VueElement } from '~/types'
import { TestSuiteState } from '~/store/projectSuite'
import { RootState } from '~/store'

type StaticTestSection = 'Test detail' | 'Welcome screen' | 'Thank you screen'

interface DragItem {
  title: StaticTestSection
  id: string
}

export default defineComponent({
  name: 'AppProjectSortSteps',
  components: { Button, SmoothDrag, FadeTransition, Tooltip },
  emits: ['shuffled'],
  setup(_, { root: { $store }, emit }) {
    const dragTitles = computed({
      get() {
        return ($store.state.projectSuite as TestSuiteState).create.section.items
      },
      set(val: TestSuiteState['create']['section']['items']) {
        if (Array.isArray(val)) {
          $store.commit('projectSuite/create/section/updateAll', val)
        }
      },
    })

    const staticTitles = ref<DragItem[]>([
      {
        title: 'Test detail',
        id: 'project-test-detail',
      },
      {
        title: 'Welcome screen',
        id: 'project-welcome-screen',
      },
      {
        title: 'Thank you screen',
        id: 'project-thank-you-screen',
      },
    ])

    const testIndexMatches = computed(() => {
      // const selfId = dragTitles.value.map((x: Record<string, any>) => x.id)

      // const storeId = testIndex.value.map((x: Record<string, any>) => x.id)

      return false
    })

    const nextStep = async () => {
      await nextTick()

      const firstForm = document
        .getElementById('project-form-wrapper')
        ?.querySelector('.FormLayout')

      if (firstForm instanceof HTMLFormElement) {
        firstForm.dispatchEvent(
          new Event('submit', {
            bubbles: true,
            cancelable: true,
          })
        )
      }
    }

    const onDragEnd = (evt: { newIndex: number }) => {
      if (!testIndexMatches.value) {
        nextTick(() => {
          // $store.commit('project/UPDATE_ALL_TEST_INDEX', dragTitles.value)

          nextTick(() => {
            emit(
              'shuffled',
              dragTitles.value[
                evt.newIndex
              ] /** listened for in pages/dashboard/project/:id/index.vue **/
            )
          })
        })
      }
    }

    const scrollToSectionId = ref(0)

    const scrollToSection = (id: string) => {
      const nextSection = document.getElementById(id) as HTMLElement | null
      const main = document.querySelector('main')

      if (nextSection && main) {
        const { layoutPadding } = layoutSizing

        const scrollY = nextSection.offsetTop - layoutPadding

        const scrollTo = scrollY

        const id = scrollToSectionId.value + 1

        scrollToSectionId.value = id

        scrollMain(scrollTo, main)
      }
    }

    const focusOnAddNewTestBtnProcessing = ref(false)

    const focusOnAddNewTestBtn = async () => {
      if (focusOnAddNewTestBtnProcessing.value) {
        return
      }

      focusOnAddNewTestBtnProcessing.value = true

      const addNewTestRoot = document.getElementById(
        'add-new-test'
      ) as VueElement

      if (addNewTestRoot) {
        addNewTestRoot.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })

        if (typeof addNewTestRoot.__vue__.togglePingBtn === 'function') {
          await sleep(600)

          addNewTestRoot.__vue__.togglePingBtn?.()

          await sleep(1000)
        }

        addNewTestRoot.querySelector('button')?.focus({ preventScroll: true })
      }

      focusOnAddNewTestBtnProcessing.value = false
    }

    const toggleSectionCollapse = (id: string) => {
      const collapseBtn = document.getElementById(`collapse-${id}`)

      if (collapseBtn) {
        collapseBtn.click()
      }
    }

    const showWarning = computed(() => {
      return ($store.state as RootState).projectSuite.create.showWarning
    })

    const testSubmitting = computed(() => {
      return ($store.state as RootState).projectSuite.create.submitting
    })

    return {
      dragTitles,
      staticTitles,
      showWarning,
      testSubmitting,
      nextStep,
      onDragEnd,
      scrollToSection,
      focusOnAddNewTestBtn,
      toggleSectionCollapse,
      getTestFeatureTitle,
      getFeature,
    }
  },
})
</script>

<template>
  <div>
    <aside
      class="sticky -mt-32"
      :class="{
        'top-64 xl:top-64': !showWarning,
        'top-120 xl:top-132': showWarning,
      }"
    >
      <div
        class="hide-scrollbar overflow-y-auto pt-32 px-4 pb-4 max-h-[calc(100vh-140px)]"
      >
        <div class="grid gap-y-8 mb-20">
          <template v-for="(staticTitle, i) in staticTitles">
            <div :key="staticTitle.title">
              <div
                class="flex items-center justify-between h-52 w-240 rounded-[3px] bg-surface-default py-4 px-10 transition-opacity active:opacity-70 cursor-pointer"
                @click="scrollToSection(staticTitle.id)"
              >
                <Tooltip v-slot="{ events }" label="Toggle expand">
                  <div
                    class="w-28 h-28 mr-4 shrink-0 bg-surface-depressed rounded-full"
                    @click="toggleSectionCollapse(staticTitle.id)"
                    v-on="events"
                  />
                </Tooltip>

                <span
                  class="font-semibold text-[14px] leading-[20px] flex-grow text-left"
                >
                  {{ staticTitle.title }}
                </span>
              </div>

              <SmoothDrag
                v-if="i === 1 && dragTitles.length"
                v-slot="{ drag }"
                v-model="dragTitles"
                group-class="grid gap-y-8 mt-10"
                @drag-end="onDragEnd"
              >
                <div
                  v-for="(item, itemIndex) in dragTitles"
                  :key="`${itemIndex}`"
                  class="flex items-center justify-between h-52 w-240 rounded-[3px] bg-surface-default py-4 px-10 drag-item transition-opacity active:opacity-70 cursor-pointer"
                  :class="{
                    'drag-handle': dragTitles.length > 1,
                  }"
                  @click="scrollToSection(item.id)"
                >
                  <Tooltip
                    v-slot="{ events }"
                    :disabled="drag"
                    label="Toggle expand"
                  >
                    <div
                      class="w-28 h-28 mr-4 shrink-0 rounded-full"
                      :style="{
                        'background-color':
                          (getFeature(item.type) || {}).color || '#000',
                      }"
                      @click="toggleSectionCollapse(item.id)"
                      v-on="events"
                    />
                  </Tooltip>

                  <span
                    class="font-semibold text-[14px] leading-[20px] flex-grow text-left pointer-events-none"
                  >
                    {{ itemIndex + 1 }}. {{ getTestFeatureTitle(item.type) }}
                  </span>

                  <span @click.stop>
                    <PIcon
                      source="DragHandleMinor"
                      class="fill-icon text-icon-default cursor-grab active:cursor-grabbing transition-opacity"
                      :class="{
                        'opacity-30 pointer-events-none': dragTitles.length < 2,
                      }"
                    />
                  </span>
                </div>
              </SmoothDrag>
            </div>
          </template>
        </div>

        <div class="grid">
          <Button full-width class="mb-20 bg-action-secondary-default">
            Preview
          </Button>

          <Button
            full-width
            primary
            :disabled="!dragTitles.length || testSubmitting || showWarning"
            @click="nextStep"
          >
            Save and continue
          </Button>

          <FadeTransition>
            <Button
              v-if="!dragTitles.length"
              id="focus-on-add-new-test"
              plain
              class="h-56 w-full"
              @click="focusOnAddNewTestBtn"
            >
              Add a test to continue
            </Button>
          </FadeTransition>
        </div>
      </div>
    </aside>
  </div>
</template>
