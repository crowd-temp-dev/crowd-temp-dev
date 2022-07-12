<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import Button from '~/components/Base/Button/index.vue'
import EditableText from '~/components/Base/EditableText/index.vue'
import Tooltip from '~/components/Base/Tooltip/index.vue'
import { CreateTestState } from '~/store/create-test/create-test'
import Skeleton from '~/components/Base/Skeleton/index.vue'

export default defineComponent({
  name: 'AppCreateTestHeader',
  components: { Button, EditableText, Tooltip, Skeleton },
  setup(_, { root }) {
    const testState = computed(
      () => root.$store.state['create-test'] as CreateTestState
    )

    const testTitle = computed({
      get() {
        return testState.value.details.name
      },
      set(val: string) {
        if (typeof val === 'string') {
          root.$store.dispatch('create-test/updateForm', {
            path: 'testDetails.name',
            value: val,
          })
        }
      },
    })

    const testPublished = computed(() => {
      return root.$store.state['create-test'].details.published
    })

    const enableEditing = computed(() => {
      return !/^\/create-test\/(?:recruit|view)/.test(root.$route.name || '')
    })

    return { testTitle, testPublished, enableEditing, testState }
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
          to="/"
          v-on="events"
        />
      </Tooltip>
      <h2
        class="ml-16 mr-8 font-sf-pro-display font-semibold text-[20px] leading-[32px]"
      >
        <Skeleton
          :loading="!testState.details.name"
          loading-class="h-36 w-120 rounded bg-surface-neutral-default"
        >
          <Tooltip
            v-slot="{ events }"
            label="Click to edit"
            :disabled="!enableEditing"
          >
            <EditableText
              v-model="testTitle"
              fallback="New Test"
              :disabled="!enableEditing"
              v-on="events"
            />
          </Tooltip>
        </Skeleton>
      </h2>

      <Skeleton
        :loading="!testState.details.name"
        loading-class="h-24 w-56 rounded-full bg-surface-neutral-default"
      >
        <Transition
          enter-class="translate-x-[-10px] opacity-0 scale-0"
          enter-active-class="ease-[var(--ease-back-out)] duration-[250ms]"
          leave-to-class="translate-x-[-10px] opacity-0 scale-0"
        >
          <PBadge
            v-if="
              ($route.name === 'create-test-:id' && !$createTestForm.empty) ||
              $route.name === 'create-test-recruit-:id' ||
              $route.name === 'create-test-view-result-:id'
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
