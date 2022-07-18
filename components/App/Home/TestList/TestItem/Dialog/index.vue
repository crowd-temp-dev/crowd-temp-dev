<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import modelSync from '~/mixins/modelSync'
import UiDialog from '~/components/Base/UiDialog/index.vue'

interface Form {
  newName?: string
  dontWarn?: boolean
}

export default defineComponent({
  name: 'AppHomeTestListTestItemDialog',
  components: { UiDialog },
  mixins: [modelSync(Boolean)],
  props: {
    testName: {
      type: String,
      required: true,
    },
    testId: {
      type: String,
      required: true,
    },
    type: {
      type: String as () => 'rename' | 'delete',
      required: true,
    },
    loadingRename: Boolean,
    loadingDelete: Boolean,
  },
  setup(_props, { root: { $store } }) {
    const onSubmit = async ({
      formValues,
      close,
    }: {
      formValues: Form
      close: () => {}
    }) => {
      if (_props.type === 'rename') {
        if (formValues.newName?.trim() !== _props.testName.trim()) {
          const { error } = await $store.dispatch('list-test/renameTest', {
            id: _props.testId,
            name: formValues.newName?.trim(),
          })

          if (!error) {
            close()
          }
        } else close()
      } else {
        const { error } = await $store.dispatch('list-test/deleteTest', {
          id: _props.testId,
          dontWarn: formValues.dontWarn,
        })

        if (!error) {
          close()
        }
      }
    }

    return { onSubmit }
  },
})
</script>

<template>
  <UiDialog v-model="modelSync" :leave-focus="`#action-${testId}`">
    <template #header>
      <h2 :class="{ 'text-base-critical': type === 'delete' }">
        {{ type === 'rename' ? 'Rename test' : 'Delete test?' }}
      </h2>
    </template>

    <template #default="{ close }">
      <FormLayout
        v-slot="{ idAndError }"
        :name="`${type}-test`"
        @on-submit="(evt) => onSubmit({ ...evt, close })"
      >
        <TextField
          v-if="type === 'rename'"
          v-bind="idAndError('newName')"
          autofocus
          required
          :value="testName"
          class="w-[570px]"
        />

        <template v-else>
          <p class="min-w-[450px]">
            <strong>
              {{ testName }}
            </strong>
            will be deleted. This action cannot be undone.
          </p>

          <Checkbox v-bind="idAndError('dontWarn')" label="Don't warn again" />
        </template>
      </FormLayout>
    </template>

    <template #footer="{ close }">
      <Button
        v-if="type === 'rename'"
        form="rename-test"
        type="submit"
        primary
        :loading="loadingRename"
      >
        Save
      </Button>

      <template v-else>
        <Button class="mr-8" plain-action @click="close"> Cancel </Button>

        <Button
          destructive
          form="delete-test"
          type="submit"
          :loading="loadingDelete"
        >
          Delete test
        </Button>
      </template>
    </template>
  </UiDialog>
</template>
