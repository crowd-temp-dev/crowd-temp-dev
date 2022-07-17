<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import Button from '~/components/Base/Button/index.vue'
import EditableText from '~/components/Base/EditableText/index.vue'
import Tooltip from '~/components/Base/Tooltip/index.vue'
import Skeleton from '~/components/Base/Skeleton/index.vue'
import { TestSuiteState } from '~/store/testSuite'
import { RootState } from '~/store'

export default defineComponent({
  name: 'AppCreateTestHeader',
  components: { Button, EditableText, Tooltip, Skeleton },
  setup(_, { root }) {
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

    return { testTitle, testPublished, enableEditing, testState, emptyTestForm }
  },
})
</script>

<template>
  <div>
    <div class="flex items-center">
      <Tooltip v-slot="{ events }" label="To home page">
        <Button
          icon="ArrowLeftMinor"
          aria-label="To home page"
          to="/dashboard"
          v-on="events"
        />
      </Tooltip>
      <h2
        class="ml-16 mr-8 font-sf-pro-display font-semibold text-[20px] leading-[32px]"
      >
        <Skeleton
          :loading="!testTitle"
          loading-class="h-36 w-120 rounded bg-surface-neutral-default"
        >
          <Tooltip
            v-slot="{ events }"
            label="Click to edit"
            :disabled="!enableEditing"
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
              $route.name === 'dashboard-create-test-view-result-:id'
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

    <div class="flex items-center">
      <Button plain-action> Duplicate </Button>

      <Button plain-action disclosure="down"> More action </Button>

      <PButtonGroup segmented>
        <Button icon="ChevronLeftMinor" disabled />

        <Button icon="ChevronRightMinor" disabled />
      </PButtonGroup>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.divider {
  @apply h-full w-1 border-l border-r-0 border-y-0 border-[#F2F2F2];
}
</style>
