<script lang="ts">
import {
  computed,
  defineComponent,
  nextTick,
  onMounted,
  ref,
  watch,
} from '@vue/composition-api'
import UiDialog from '../../UiDialog/index.vue'
import FormLayout from '../../FormLayout/index.vue'
import TextField from '../../TextField/index.vue'
import DropZone from '../../DropZone/index.vue'
import { sleep, validRouteDialog } from '~/utils'
import type { RouteDialog } from '~/types'

export default defineComponent({
  name: 'BaseRouteDialogFeedbackForm',
  components: { UiDialog, FormLayout, TextField, DropZone },
  setup(_, { root }) {
    const dialogActive = ref(false)

    const dialogTitle = ref('')

    const appDialogRoute = computed(() => root.$appState.routeDialog)

    const currentRouteDialog = ref<RouteDialog>(null)

    const textFields = computed<
      {
        label: string
        placeholder: string
        id: string
        props?: Record<string, any>
      }[]
    >(() => {
      const textArea = {
        props: {
          multiline: true,
          minHeight: 92,
        },
      }

      switch (currentRouteDialog.value) {
        case 'give-feedback':
          return [
            {
              label: 'What would like us to know?',
              placeholder: 'A quick summary of your feedback',
              id: 'feedbackTitle',
            },
            {
              label: 'Description',
              placeholder: 'The details of your feedback',
              id: 'feedbackDescription',
              ...textArea,
            },
          ]
        case 'contact-us':
          return [
            {
              label: 'Email',
              placeholder: 'Your email',
              id: 'userEmail',
              props: {
                type: 'email',
              },
            },
            {
              label: 'Message',
              placeholder: 'Your message',
              id: 'userMessage',
              ...textArea,
            },
          ]
        case 'request-feature':
          return [
            {
              label: 'What feature would make Crowd better',
              placeholder: 'A quick summary of your idea',
              id: 'featureTitle',
            },
            {
              label: 'Description',
              placeholder: 'The details of your idea',
              id: 'featureDescription',
              ...textArea,
            },
          ]
        default:
          return []
      }
    })

    const mobileDialogProps = computed(() => {
      if (root.$breakpoint.isMobile) {
        return {
          from: 'bottom',
          asDrawer: true,
          contentClass: '!rounded-b-none h-fit w-full',
          rootClass: '!p-0 items-end',
        }
      } else return {}
    })

    const removeDialogQuery = () => {
      if (
        appDialogRoute.value &&
        appDialogRoute.value === currentRouteDialog.value
      ) {
        root.$router.replace({
          query: {
            ...root.$route.query,
            dialog: undefined,
          },
        })

        root.$store.commit('app/setRouteDialog', '')
      }
    }

    const toggleDialogActive = async () => {
      root.$store.commit('app/setRouteDialog', root.$route.query.dialog)

      await nextTick()

      const isActive = () => validRouteDialog.includes(appDialogRoute.value)

      if (isActive()) {
        if (dialogActive.value) {
          dialogActive.value = false

          await sleep(250)
        }

        const getTitle = () => {
          switch (appDialogRoute.value) {
            case 'contact-us':
              return 'Contact us'
            case 'give-feedback':
              return 'Give feedback'
            case 'report-bug':
              return 'Report a bug'
            case 'request-feature':
              return 'Request a feature'
            default:
              return ''
          }
        }

        currentRouteDialog.value = appDialogRoute.value

        dialogTitle.value = getTitle()

        await nextTick()

        if (isActive()) {
          root.$store.commit('app/setRouteDialog', appDialogRoute.value)

          dialogActive.value = true
        }
      } else {
        dialogActive.value = false
      }
    }

    onMounted(async () => {
      await sleep(500)

      toggleDialogActive()
    })

    watch(
      () => root.$route.query.dialog,
      () => {
        nextTick(toggleDialogActive)
      }
    )

    return {
      dialogActive,
      dialogTitle,
      textFields,
      currentRouteDialog,
      mobileDialogProps,
      removeDialogQuery,
    }
  },
})
</script>

<template>
  <UiDialog
    v-if="$appState.mounted"
    :key="$route.path + $breakpoint.is + $nuxt.layoutName"
    :model-value="dialogActive"
    :body-class="$breakpoint.isMobile ? undefined : 'pb-0'"
    v-bind="mobileDialogProps"
    @on-close="removeDialogQuery"
  >
    <template #header>
      <span class="font-semibold lg:font-normal">
        {{ dialogTitle }}
      </span>
    </template>

    <FormLayout
      v-slot="{ idAndError }"
      :name="`route-form-${dialogTitle}`"
      class="min-w-full lg:min-w-[558px] isolate"
    >
      <div class="grid gap-y-20 px-8 -mb-8 isolate">
        <template v-if="currentRouteDialog !== 'report-bug'">
          <TextField
            v-for="(field, i) in textFields"
            :key="i"
            :label="field.label"
            :placeholder="field.placeholder"
            required
            :autofocus="i === 0 && !$breakpoint.isMobile"
            v-bind="{
              ...idAndError(field.id),
              ...(field.props || {}),
            }"
          />
        </template>

        <template v-else>
          <TextField
            label="Describe the issue"
            placeholder="The more information, the better"
            multiline
            :min-height="92"
            required
            :autofocus="!$breakpoint.isMobile"
            v-bind="idAndError('describeIssue')"
          />

          <Id v-slot="{ id }">
            <div>
              <label :for="id" class="mb-3 inline-block">
                Attach screenshot or screen recording
              </label>

              <DropZone :id="id" accept="image/*,video/*" />
            </div>
          </Id>
        </template>
      </div>

      <div class="sticky bottom-0 z-1 bg-surface-default">
        <hr class="h-1 w-full" />

        <div class="h-78 flex-centered px-8">
          <Button primary size="large" full-width type="submit">
            Submit
          </Button>
        </div>
      </div>
    </FormLayout>
  </UiDialog>
</template>
