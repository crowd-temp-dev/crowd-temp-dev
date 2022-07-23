<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api'
import AddNewTest from '../AddNewTest/index.vue'
import Form from '../Form/index.vue'
import Button from '~/components/Base/Button/index.vue'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'
import Dropdown from '~/components/Base/Dropdown/index.vue'
import { layoutSizing, scrollMain, sleep, uuidv4 } from '~/utils'
import Tooltip from '~/components/Base/Tooltip/index.vue'
import { TestSuiteState } from '~/store/projectSuite'

export default defineComponent({
  name: 'AppProjectStepsSection',
  components: {
    Button,
    AddNewTest,
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
    hideAddNewTest: Boolean,
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
    const expanded = computed(() => {
      const collapsed = (root.$store.state.projectSuite as TestSuiteState).create
        .collapsed.items

      return !collapsed.includes(_props.id)
    })

    const toggleExpand = (val: boolean) => {
      if (val) {
        root.$store.commit('projectSuite/create/collapsed/remove', _props.id)
      } else {
        root.$store.commit('projectSuite/create/collapsed/add', _props.id)
      }
    }

    const removeSection = () => {
      sleep(200).then(() => {
        root.$store.commit(
          'projectSuite/create/section/remove',
          _props.storeIndex - 1
        )
      })
    }

    const duplicateSection = async () => {
      let newTest = (
        root.$store.state.projectSuite as TestSuiteState
      ).create.section.items.find((x) => x.id === _props.id)

      if (newTest) {
        newTest = {
          ...newTest,
          id: uuidv4(),
          followUpQuestions: newTest.followUpQuestions?.map((question) => ({
            ...question,
            id: uuidv4(),
          })),
        }

        root.$store.commit('projectSuite/create/section/add', {
          index: _props.storeIndex - 1,
          data: newTest,
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
      expanded,
      toggleExpand,
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
      class="outline-none"
      :style="{ '--fade-leave-duration': '150ms' }"
    >
      <Form
        v-slot="formProps"
        :name="`test-form-${storeIndex || id}`"
        class="!space-y-0 w-full max-w-[800px] bg-surface-default rounded-lg p-20 shadow-2"
      >
        <div>
          <div
            class="flex items-center justify-between transition-all"
            :class="{
              'mb-24': expanded,
              'mb-0': !expanded,
            }"
          >
            <h3 class="font-semibold text-heading">
              {{ title }}
            </h3>

            <div class="flex items-center">
              <div
                v-if="!isStatic"
                class="flex justify-between items-center mr-20"
              >
                <div class="text-icon-default flex items-center space-x-20">
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
                      <Tooltip
                        v-slot="{ events }"
                        :disabled="active"
                        label="Delete question"
                      >
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
                              : events
                          "
                        >
                          <PIcon source="DeleteMajor" class="fill-icon" />
                        </button>
                      </Tooltip>
                    </template>

                    <template #content="{ events, close }">
                      <div class="p-12">
                        <p class="mb-8">
                          <strong> Delete this section? </strong>
                        </p>

                        <menu
                          class="flex space-x-8 items-center justify-between"
                        >
                          <Button
                            tabindex="-1"
                            role="menuitem"
                            class="pseudo-focus"
                            size="slim"
                            plain-action
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
                        </menu>
                      </div>
                    </template>
                  </Dropdown>
                </div>
              </div>

              <Button
                :id="id ? `collapse-${id}` : undefined"
                @click="toggleExpand(!expanded)"
              >
                {{ expanded ? 'Collapse' : 'Expand' }}
              </Button>
            </div>
          </div>
        </div>

        <div v-if="expanded">
          <slot v-bind="formProps" />
        </div>
      </Form>

      <AddNewTest
        v-if="!hideAddNewTest"
        :section-index="id ? storeIndex : undefined"
      />
    </section>
  </FadeTransition>
</template>
