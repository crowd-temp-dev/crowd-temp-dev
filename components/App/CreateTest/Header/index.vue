<script lang="ts">
import { defineComponent, computed, ref, watch } from '@vue/composition-api'
import CommentDialog from './CommentDialog/index.vue'
import Button from '~/components/Base/Button/index.vue'
import EditableText from '~/components/Base/EditableText/index.vue'
import Tooltip from '~/components/Base/Tooltip/index.vue'
import Skeleton from '~/components/Base/Skeleton/index.vue'
import { TestSuiteState } from '~/store/testSuite'
import { RootState } from '~/store'
import DialogButton from '~/components/Base/DialogButton/index.vue'
import Dropdown, { DropdownOption } from '~/components/Base/Dropdown/index.vue'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'
import { sleep, uid } from '~/utils'

export default defineComponent({
  name: 'AppCreateTestHeader',
  components: {
    Button,
    EditableText,
    Tooltip,
    Skeleton,
    DialogButton,
    Dropdown,
    FadeTransition,
    CommentDialog,
  },
  setup(_, { root }) {
    const showCommentDialog = ref(false)

    const moreActionsId = ref(uid())

    const testState = computed(
      () => root.$store.state.testSuite as TestSuiteState
    )

    const testTitle = computed({
      get() {
        return testState.value.detail.name
      },
      set(val: string) {
        if (typeof val === 'string') {
          root.$store.commit('testSuite/detail/setData', {
            name: val,
          })
        }
      },
    })

    const testPublished = computed(() => {
      return testState.value.detail.published
    })

    const enableEditing = computed(() => {
      return root.$route.name === 'dashboard-create-test-:id'
    })

    const emptyTestForm = computed(() => {
      const state = (root.$store.state as RootState).testSuite

      return !state.detail.created && !state.create.section.items.length
    })

    const moreActions = computed<DropdownOption[]>(() => {
      return [
        {
          title: 'Copy preview link',
          onClick: () => {},
        },
        {
          title: 'View preview comments',
          onClick: async () => {
            await sleep()

            showCommentDialog.value = true
          },
        },
        {
          title: 'Duplicate',
          onClick: () => {},
        },
      ]
    })

    watch(
      () => root.$route.path,
      () => {
        showCommentDialog.value = false
      }
    )

    return {
      testTitle,
      testPublished,
      enableEditing,
      testState,
      emptyTestForm,
      moreActions,
      showCommentDialog,
      moreActionsId,
    }
  },
})
</script>

<template>
  <div>
    <div class="flex items-center">
      <h2
        class="mr-8 font-sf-pro-display font-semibold text-[20px] leading-[32px]"
      >
        <Skeleton
          :loading="!testTitle"
          loading-class="h-36 w-120 rounded bg-surface-neutral-default"
        >
          <Tooltip
            v-slot="{ events }"
            label="Click to edit"
            :disabled="!enableEditing"
            open-delay="50"
            :class="{ 'cursor-default': !enableEditing }"
          >
            <EditableText
              fallback="New Test"
              :disabled="!enableEditing"
              :model-value="testTitle"
              @update:modelValue="(e) => (testTitle = e)"
              v-on="events"
            />
          </Tooltip>
        </Skeleton>
      </h2>

      <Skeleton
        :loading="!testTitle"
        loading-class="h-24 w-56 rounded-full bg-surface-neutral-default"
      >
        <Transition
          enter-class="translate-x-[-10px] opacity-0 scale-0"
          enter-active-class="ease-[var(--ease-back-out)] duration-[250ms]"
          leave-to-class="translate-x-[-10px] opacity-0 scale-0"
        >
          <PBadge
            v-if="
              ($route.name === 'dashboard-create-test-:id' && !emptyTestForm) ||
              $route.name === 'dashboard-create-test-recruit-:id' ||
              $route.name.startsWith('dashboard-create-test-view-result-')
            "
            class="origin-left transition-[opacity,transform]"
            :class="[
              testPublished
                ? 'bg-surface-success-default'
                : 'bg-surface-neutral-default',
            ]"
          >
            {{ testPublished ? 'Published' : 'Draft' }}
          </PBadge>
        </Transition>
      </Skeleton>
    </div>

    <FadeTransition>
      <div
        v-if="$route.name === 'dashboard-create-test-:id'"
        class="flex items-center"
      >
        <DialogButton plain-action>
          <span> Use template </span>

          <template #dialog-header>
            <div>Templates</div>
          </template>

          <template #dialog>
            <div>Template will show here...</div>
          </template>
        </DialogButton>

        <Dropdown
          v-slot="{ events, active }"
          :option="moreActions"
          placement="bottom-start"
          :offset="[-4, 4]"
        >
          <Button
            :id="moreActionsId"
            plain-action
            :disclosure="active ? 'up' : 'down'"
            v-on="events"
          >
            More actions
          </Button>
        </Dropdown>

        <CommentDialog
          v-model="showCommentDialog"
          :leave-focus="`#${moreActionsId}`"
        />
      </div>
    </FadeTransition>
  </div>
</template>

<style lang="postcss" scoped>
.divider {
  @apply h-full w-1 border-l border-r-0 border-y-0 border-[#F2F2F2];
}
</style>
