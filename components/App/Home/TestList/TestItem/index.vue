<script lang="ts">
import { computed, defineComponent, nextTick, ref } from '@vue/composition-api'
import type { TestItemStatus } from '../type'
import Dialog from './Dialog/index.vue'
import Button from '~/components/Base/Button/index.vue'
import Tooltip from '~/components/Base/Tooltip/index.vue'
import { LikeNumber } from '~/types'
import CopyText from '~/components/Base/CopyText/index.vue'
import Spinner from '~/components/Base/Spinner/index.vue'
import Dropdown, { DropdownOption } from '~/components/Base/Dropdown/index.vue'

export default defineComponent({
  name: 'AppHomeTestListTestItem',
  components: { Button, Tooltip, CopyText, Spinner, Dropdown, Dialog },
  props: {
    favourite: Boolean,
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    createdAt: {
      type: String,
      required: true,
    },
    responses: {
      type: [Number, String] as unknown as () => LikeNumber,
      required: true,
    },
    notes: {
      type: Number,
      // required: true,
      default: 0,
    },
    progress: {
      type: String as () => TestItemStatus,
      required: true,
    },
    shareLink: {
      type: String,
      default: undefined,
    },
    stopAcceptingResponse: Boolean,
    to: {
      type: String,
      default: undefined,
    },
    toggleFavourite: {
      type: Function,
      required: true,
    },
    loadingFavourite: Boolean,
    loadingRename: Boolean,
    loadingDelete: Boolean,
  },
  emits: [],

  setup(_props, { root: { $store, $user } }) {
    const dialogType = ref<'delete' | 'rename'>(null)

    const showDialog = ref(false)

    const responseDisabled = computed(() => {
      return _props.progress === 'Completed' || _props.stopAcceptingResponse
    })

    const statusIcon = computed(() => {
      if (responseDisabled.value) {
        return 'MarkFulfilledMinor'
      }

      switch (_props.progress) {
        case 'Collecting response':
          return 'custom-loading'
        default:
          return 'EditMinor'
      }
    })

    const isDraft = computed(() => _props.progress.startsWith('Draft:'))

    const dropdownOptions = computed<DropdownOption[]>(() => {
      const openDialog = async (type: typeof dialogType.value) => {
        dialogType.value = type

        await nextTick()

        showDialog.value = true
      }

      return [
        {
          onClick: () => {
            openDialog('rename')
          },
          title: 'Rename',
        },
        {
          onClick: () => {},
          title: 'Duplicate',
        },
        {
          onClick: async () => {
            if ($user.deleteTestWarn) {
              openDialog('delete')
            } else {
              await $store.dispatch('list-test/deleteTest', {
                id: _props.id,
              })
            }
          },
          title: 'Delete',
        },
      ]
    })

    const formatDate = (val: string) => {
      const date = new Date(val)

      // date error: 00:10pm instead of 00:10am
      return date
        .toLocaleDateString('us', {
          hour12: true,
          hour: '2-digit',
          minute: '2-digit',
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
        })
        .replace(',', '')
        .toUpperCase()
    }

    return {
      statusIcon,
      isDraft,
      responseDisabled,
      dropdownOptions,
      showDialog,
      dialogType,
      formatDate,
    }
  },
})
</script>

<template>
  <li
    :id="id"
    class="bg-surface-default border border-divider rounded-lg p-20 flex items-center"
  >
    <span class="mr-18">
      <Tooltip
        v-slot="{ events }"
        label="Toggle favourite"
        placement="left"
        open-delay="500"
        :disabled="loadingFavourite"
      >
        <Button
          plain
          class="text-icon-default hover:text-icon-hovered focus:text-icon-pressed"
          aria-label="Toggle favourite"
          @click="
            () => {
              toggleFavourite()

              events.click()
            }
          "
          v-on="events"
        >
          <div class="w-20 h-20 flex-centered">
            <PIcon
              v-if="!loadingFavourite"
              :source="favourite ? 'StarFilledMinor' : 'StarOutlineMinor'"
              class="fill-icon"
            />

            <Spinner v-else />
          </div>
        </Button>
      </Tooltip>
    </span>

    <div class="flex items-center w-full mr-32">
      <div class="w-[42%]">
        <!-- TODO: make search component with render fn to avoid hack below -->
        <VHTML tag="strong" :text="name" />

        <p class="caption">Created {{ formatDate(createdAt) }}</p>
      </div>

      <div class="w-[18%]">
        <strong> {{ responses }} </strong>

        <p class="caption">Response{{ responses > 1 ? 's' : '' }}</p>
      </div>

      <div class="w-[18%]">
        <strong> {{ notes }}</strong>

        <p class="caption">Note{{ notes > 1 ? 's' : '' }}</p>
      </div>

      <div class="w-22%">
        <div
          class="flex items-center text-left space-x-10"
          :class="{
            'text-base-success  fill-base-success': responseDisabled,
            'fill-icon-default': !responseDisabled,
          }"
        >
          <PIcon
            v-if="statusIcon !== 'custom-loading'"
            :source="statusIcon"
            class="shrink-0 m-0"
          />

          <svg
            v-if="statusIcon === 'custom-loading'"
            height="20"
            width="20"
            style="
              stroke-dasharray: 60;
              stroke-dashoffset: 80;
              stroke-linecap: round;
            "
            class="fill-icon-default text-icon-default"
          >
            <circle
              cx="10"
              cy="10"
              r="8"
              stroke="currentColor"
              stroke-width="2"
              fill="transparent"
            />
          </svg>

          <strong class="shrink-0">
            <span v-if="!isDraft">
              {{ responseDisabled ? 'Completed' : progress }}
            </span>

            <span v-else>
              Draft:
              <span class="text-text-subdued">
                {{ progress.replace('Draft: ', '') }}
              </span>
            </span>
          </strong>
        </div>

        <div class="caption ml-30">
          <span v-if="progress !== 'Collecting response'">
            {{ responseDisabled ? 'Link disabled' : 'No link created yet' }}
          </span>

          <CopyText
            v-else-if="shareLink"
            v-slot="{ copy }"
            :text="shareLink"
            success-message="Link copied"
          >
            <Button
              plain
              :class="{
                'text-text-subdued pointer-events-none': responseDisabled,
              }"
              v-on="
                responseDisabled
                  ? {}
                  : {
                      click: copy,
                    }
              "
            >
              {{ `${responseDisabled ? 'Link disabled' : 'Copy share link'}` }}
            </Button>
          </CopyText>
        </div>
      </div>
    </div>

    <div class="mr-12 shrink-0 w-142">
      <Button full-width :to="to">
        {{ isDraft ? 'Continue' : 'View responses' }}
      </Button>
    </div>

    <div>
      <Dropdown
        v-slot="{ events, active }"
        :option="dropdownOptions"
        :offset="[6, 4]"
        content-class="min-w-[120px]"
      >
        <button
          :id="`action-${id}`"
          class="outline-none transition-opacity active:opacity-70 flex-centered rounded w-20 h-20 ring-offset-1 focus-visible:ring-2 ring-action-primary-default"
          :class="{ 'ring-2': active }"
          v-on="events"
        >
          <Spinner
            v-if="(loadingRename || loadingDelete) && showDialog"
            class="text-icon-default"
          />

          <PIcon
            v-else
            source="HorizontalDotsMinor"
            class="fill-icon-default"
          />
        </button>
      </Dropdown>

      <Dialog
        v-if="dialogType"
        v-model="showDialog"
        :test-name="name"
        :test-id="id"
        :type="dialogType"
        :loading-rename="loadingRename"
        :loading-delete="loadingDelete"
      />
    </div>
  </li>
</template>

<style scoped lang="postcss">
.caption {
  @apply mt-8 text-caption-sm text-text-subdued;
}
</style>
