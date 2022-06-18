<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api'
import LabelSwitch from '../Switch/index.vue'
import AddNewBlock from '../AddNewBlock/index.vue'
import Form from '../Form/index.vue'
import Button from '~/components/Base/Button/index.vue'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'
import Dropdown from '~/components/Base/Dropdown/index.vue'
import { TestIndex } from '~/store/createTest/state'
import { layoutSizing, scrollMain, sleep, uuidv4 } from '~/utils'
import { CreateTestState } from '~/store/create-test'
import Tooltip from '~/components/Base/Tooltip/index.vue'

export default defineComponent({
  name: 'AppCreateTestStepsSection',
  components: {
    Button,
    LabelSwitch,
    AddNewBlock,
    FadeTransition,
    Dropdown,
    Form,
    Tooltip,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    hideAddNewBlock: Boolean,
    isStatic: Boolean,
    id: {
      type: String,
      default: undefined,
    },
    storeIndex: {
      type: Number,
      default: undefined,
    },
  },

  setup(_props, { root }) {
    const testIndex = computed(
      () =>
        root.$store.state.createTest.testIndex[_props.storeIndex - 1] ||
        ({} as TestIndex)
    )

    const manualExpanded = ref(true)

    const expanded = computed(() => {
      const storeState = testIndex.value.expanded

      return typeof storeState === 'undefined'
        ? manualExpanded.value
        : storeState
    })

    const toggleExpand = (val: boolean) => {
      if (testIndex.value.id) {
        root.$store.commit('createTest/UPDATE_TEST_INDEX', {
          id: testIndex.value.id,
          value: {
            ...testIndex.value,
            expanded: val,
          },
        })
      }

      manualExpanded.value = val
    }

    const removeSection = () => {
      sleep(200).then(() => {
        root.$store.dispatch('create-test/updateForm', {
          path: '',
          value: Object.fromEntries(
            Object.entries(
              (root.$store.state['create-test'] as CreateTestState).form
            ).filter((entry) => entry[1].id !== _props.id)
          ),
          override: true,
        })
      })
    }

    const duplicateSection = async () => {
      let newTest = root.$createTestForm.questions.find(
        (x) => x.id === _props.id
      )

      if (newTest) {
        newTest = {
          ...newTest,
          id: uuidv4(),
          followUpQuestions: newTest.followUpQuestions?.map((question) => ({
            ...question,
            id: uuidv4(),
          })),
        }

        const questionsValues = Object.entries(
          root.$store.state['create-test'].form
        )
          .filter((entry) => {
            return /^question-\d+$/.test(entry[0])
          })
          .map((entry) => entry[1])

        const newIndex = (_props.storeIndex || 0)

        const newQuestionsEntries = [
          ...questionsValues.slice(0, newIndex),
          newTest,
          ...questionsValues.slice(newIndex),
        ].map((value, index) => [`question-${index + 1}`, value])

        root.$store.dispatch('create-test/updateForm', {
          value: Object.fromEntries(newQuestionsEntries),
          path: '',
        })

        await sleep(32)

        const newElement = document.getElementById(
          newTest.id
        ) as HTMLElement | null

        if (newElement) {
          newElement.focus({ preventScroll: true })

          scrollMain(newElement.offsetTop - layoutSizing.allSizes)
        }
      }
    }

    const focusOnSelfOrCloseDropdown = (evt: FocusEvent, close: () => void) => {
      if (
        evt.relatedTarget instanceof HTMLElement &&
        evt.relatedTarget.matches('button')
      ) {
        ;(evt.currentTarget as HTMLElement).focus()
      } else close()
    }

    return {
      toggleExpand,
      expanded,
      removeSection,
      focusOnSelfOrCloseDropdown,
      duplicateSection,
    }
  },
})
</script>

<template>
  <FadeTransition>
    <section
      :id="id"
      :tabindex="id ? '0' : undefined"
      :style="{ '--fade-leave-duration': '150ms' }"
    >
      <Form
        :name="`test-form-${storeIndex || id}`"
        class="!space-y-0 w-full max-w-[800px] bg-surface-default rounded-lg p-20 shadow-2"
      >
        <div>
          <h3
            class="flex items-center justify-between font-semibold text-heading transition-all"
            :class="{
              'mb-24': expanded,
              'mb-0': !expanded,
            }"
          >
            {{ title }}

            <Button
              :id="id ? `collapse-${id}` : undefined"
              @click="toggleExpand(!expanded)"
            >
              {{ expanded ? 'Collapse' : 'Expand' }}
            </Button>
          </h3>

          <div
            v-if="expanded && !isStatic"
            class="flex justify-between items-center mb-20"
          >
            <LabelSwitch label="Add conditional Logic" />

            <div class="text-icon-default flex items-center space-x-26">
              <Tooltip v-slot="{ events }" label="Duplicate section">
                <span class="cursor-pointer" v-on="events">
                  <PIcon
                    source="DuplicateMinor"
                    class="fill-icon"
                    @click="duplicateSection"
                  />
                </span>
              </Tooltip>

              <Dropdown :offset="[4, 2]">
                <template #default="{ active, toggle, close }">
                  <button
                    tabindex="0"
                    type="button"
                    class="outline-none ring-offset-2 focus:ring-2 focus:ring-action-primary-default rounded-full transition-colors duration-[250ms]"
                    :class="{
                      'ring-2 ring-action-primary-default bg-background-selected':
                        active,
                    }"
                    @click="toggle"
                    v-on="
                      active
                        ? {
                            blur: (evt) =>
                              focusOnSelfOrCloseDropdown(evt, close),
                          }
                        : {}
                    "
                  >
                    <PIcon source="DeleteMajor" class="fill-icon" />
                  </button>
                </template>

                <template #content="{ events, close }">
                  <div class="p-12">
                    <p class="mb-8">
                      <strong> Delete this section? </strong>
                    </p>

                    <div class="flex space-x-8 items-center justify-between">
                      <Button
                        tabindex="-1"
                        role="menuitem"
                        class="pseudo-focus"
                        size="slim"
                        v-on="events"
                        @click="close"
                      >
                        Cancel
                      </Button>

                      <Button
                        tabindex="-1"
                        role="menuitem"
                        destructive
                        class="pseudo-focus"
                        size="slim"
                        v-on="events"
                        @click.stop="
                          () => {
                            close()
                            removeSection()
                          }
                        "
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </template>
              </Dropdown>
            </div>
          </div>
        </div>

        <FadeTransition :duration="{ leave: 1, enter: 250 }">
          <div v-if="expanded">
            <slot />
          </div>
        </FadeTransition>
      </Form>

      <AddNewBlock
        v-if="!hideAddNewBlock"
        :section-index="id ? storeIndex : undefined"
      />
    </section>
  </FadeTransition>
</template>
