<script lang="ts">
import { computed, defineComponent, nextTick, ref } from '@vue/composition-api'
import SmootDrag from '@/components/Base/SmoothDrag/index.vue'
import Button from '~/components/Base/Button/index.vue'
import { scrollMain, layoutSizing, sleep, getTestFeatureTitle } from '~/utils'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'
import Tooltip from '~/components/Base/Tooltip/index.vue'
import { VueElement } from '~/types'
import { TestSuiteState } from '~/store/testSuite'
import { RootState } from '~/store'

type StaticTestSection = 'Test detail' | 'Welcome screen' | 'Thank you screen'

interface DragItem {
  title: StaticTestSection
  id: string
}

export default defineComponent({
  name: 'AppCreateTestSortSteps',
  components: { Button, SmootDrag, FadeTransition, Tooltip },
  emits: ['shuffled'],
  setup(_, { root: { $store }, emit }) {
    const dragTitles = computed({
      get() {
        return ($store.state.testSuite as TestSuiteState).create.section.items
      },
      set(val: TestSuiteState['create']['section']['items']) {
        if (Array.isArray(val)) {
          $store.commit('testSuite/create/section/updateAll', val)
        }
      },
    })

    const staticTitles = ref<DragItem[]>([
      {
        title: 'Test detail',
        id: 'create-test-test-detail',
      },
      {
        title: 'Welcome screen',
        id: 'create-test-welcome-screen',
      },
      {
        title: 'Thank you screen',
        id: 'create-test-thank-you-screen',
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
        .getElementById('create-test-form-wrapper')
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
          $store.commit('createTest/UPDATE_ALL_TEST_INDEX', dragTitles.value)

          nextTick(() => {
            emit(
              'shuffled',
              dragTitles.value[
                evt.newIndex
              ] /** listened for in pages/create-steps/index.vue **/
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
        const { appHeader, layoutHeader, layoutPadding } = layoutSizing

        const scrollY =
          nextSection.offsetTop - appHeader - layoutHeader - layoutPadding

        const scrollTo = scrollY

        const id = scrollToSectionId.value + 1

        scrollToSectionId.value = id

        scrollMain(scrollTo, main)
      }
    }

    const focusOnAddNewBlockBtnProcessing = ref(false)

    const focusOnAddNewBlockBtn = async () => {
      if (focusOnAddNewBlockBtnProcessing.value) {
        return
      }

      focusOnAddNewBlockBtnProcessing.value = true

      const addNewBlockRoot = document.getElementById(
        'add-new-block'
      ) as VueElement

      if (addNewBlockRoot) {
        addNewBlockRoot.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })

        if (typeof addNewBlockRoot.__vue__.togglePingBtn === 'function') {
          await sleep(600)

          addNewBlockRoot.__vue__.togglePingBtn?.()

          await sleep(1000)
        }

        addNewBlockRoot.querySelector('button')?.focus({ preventScroll: true })
      }

      focusOnAddNewBlockBtnProcessing.value = false
    }

    const toggleSectionCollapse = (id: string) => {
      const collapseBtn = document.getElementById(`collapse-${id}`)

      if (collapseBtn) {
        collapseBtn.click()
      }
    }

    const showWarning = computed(() => {
      return ($store.state as RootState).testSuite.create.showWarning
    })

    const testSubmitting = computed(() => {
      return ($store.state as RootState).testSuite.create.submitting
    })

    return {
      dragTitles,
      staticTitles,
      showWarning,
      testSubmitting,
      nextStep,
      onDragEnd,
      scrollToSection,
      focusOnAddNewBlockBtn,
      toggleSectionCollapse,
      getTestFeatureTitle,
    }
  },
})
</script>

<template>
  <div>
    <aside
      class="sticky -mt-32"
      :class="{
        'top-64 xl:top-76': !showWarning,
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
                    class="w-28 h-28 mr-4 shrink-0 bg-decorative-surface-five rounded-full"
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

              <SmootDrag
                v-if="i === 1 && dragTitles.length"
                v-model="dragTitles"
                group-class="grid gap-y-8 mt-10"
                @drag-end="onDragEnd"
              >
                <div
                  v-for="(item, itemIndex) in dragTitles"
                  :key="`${itemIndex}`"
                  class="flex items-center justify-between h-52 w-240 rounded-[3px] bg-surface-default py-4 px-10 drag-item transition-opacity active:opacity-70 cursor-pointer"
                  @click="scrollToSection(item.id)"
                >
                  <Tooltip v-slot="{ events }" label="Toggle expand">
                    <div
                      class="w-28 h-28 mr-4 shrink-0 bg-decorative-surface-five rounded-full"
                      @click="toggleSectionCollapse(item.id)"
                      v-on="events"
                    />
                  </Tooltip>

                  <span
                    class="font-semibold text-[14px] leading-[20px] flex-grow text-left pointer-events-none"
                  >
                    {{ itemIndex + 1 }}. {{ getTestFeatureTitle(item.type) }}
                  </span>

                  <span
                    :class="{
                      'drag-handle': dragTitles.length > 1,
                    }"
                    @click.stop
                  >
                    <PIcon
                      source="DragHandleMinor"
                      class="fill-icon text-icon-default cursor-grab active:cursor-grabbing drag-handle transition-opacity"
                      :class="{
                        'opacity-30 pointer-events-none': dragTitles.length < 2,
                      }"
                    />
                  </span>
                </div>
              </SmootDrag>
            </div>
          </template>
        </div>

        <Button full-width class="mb-20 bg-action-secondary-default">
          Preview
        </Button>

        <Button
          full-width
          primary
          :disabled="
            !dragTitles.length ||
            testSubmitting ||
            showWarning
          "
          @click="nextStep"
        >
          Save and continue
        </Button>

        <FadeTransition>
          <Button
            v-if="!dragTitles.length"
            id="focus-on-add-new-block"
            plain
            class="h-56 w-full"
            @click="focusOnAddNewBlockBtn"
          >
            Add a test to continue
          </Button>
        </FadeTransition>
      </div>
    </aside>
  </div>
</template>
