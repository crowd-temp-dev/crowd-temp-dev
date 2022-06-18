<script lang="ts">
import { computed, defineComponent, nextTick } from '@vue/composition-api'
import type { TestItemStatus } from '../type'
import Button from '~/components/Base/Button/index.vue'
import Tooltip from '~/components/Base/Tooltip/index.vue'

export default defineComponent({
  name: 'AppHomeTestListTestItem',
  components: { Button, Tooltip },
  props: {
    favourite: Boolean,
    id: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    responses: {
      type: Number,
      required: true,
    },
    notes: {
      type: Number,
      required: true,
    },
    status: {
      type: String as () => TestItemStatus,
      required: true,
    },
  },
  emits: [],

  setup(_props, { root }) {
    const statusIcon = computed(() => {
      switch (_props.status) {
        case 'Completed':
          return 'MarkFulfilledMinor'
        case 'Collecting response':
          return 'custom-loading'
        default:
          return 'EditMinor'
      }
    })

    const isDraft = computed(() => _props.status.startsWith('Draft: '))

    const toggleFavourite = () => {
      const favourite = !_props.favourite

      root.$store.commit('testList/UPDATE_ITEM', {
        id: _props.id,
        value: {
          ..._props,
          favourite,
        },
      })

      nextTick(() => {
        const favouriteTests = root.$store.getters['testList/favourite']

        if (!favouriteTests.length) {
          root.$store.commit('testList/SHOW_FAVOURITE', false)
        }
      })
    }

    return { statusIcon, isDraft, toggleFavourite }
  },
})
</script>

<template>
  <li
    :id="id"
    class="bg-surface-default border border-divider rounded-lg p-20 flex items-center"
  >
    <span class="mr-18">
      <Tooltip v-slot="{ events }" label="Toggle favourite" placement="left" open-delay="500">
        <Button
          plain
          aria-label="Toggle favourite"
          :icon="favourite ? 'StarFilledMinor' : 'StarOutlineMinor'"
          class="fill-icon-default"
          @click="
            () => {
              toggleFavourite()

              events.click()
            }
          "
          v-on="events"
        />
      </Tooltip>
    </span>

    <div class="flex items-center w-full mr-32">
      <div class="w-[42%]">
        <strong> {{ title }} </strong>

        <p class="caption">{{ date }}</p>
      </div>

      <div class="w-[18%]">
        <strong> {{ responses }} </strong>

        <p class="caption">Responses</p>
      </div>

      <div class="w-[18%]">
        <strong> {{ notes }}</strong>

        <p class="caption">Notes</p>
      </div>

      <div class="w-22%">
        <div
          class="flex items-center text-left space-x-10"
          :class="{
            'text-base-success  fill-base-success': status === 'Completed',
            'fill-icon-default': status !== 'Completed',
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
              {{ status }}
            </span>

            <span v-else>
              Draft:
              <span class="text-text-subdued">
                {{ status.replace('Draft: ', '') }}
              </span>
            </span>
          </strong>
        </div>

        <div class="caption ml-30">
          <span v-if="status !== 'Collecting response'">
            {{
              status === 'Completed' ? 'Link disabled' : 'No link created yet'
            }}
          </span>

          <Button v-else plain> Copy share link </Button>
        </div>
      </div>
    </div>

    <div class="mr-12 shrink-0 w-142">
      <Button full-width>
        {{ isDraft ? 'Continue' : 'View responses' }}
      </Button>
    </div>

    <div>
      <PIcon source="HorizontalDotsMinor" class="fill-icon-default" />
    </div>
  </li>
</template>

<style scoped lang="postcss">
.caption {
  @apply mt-8 text-caption-sm text-text-subdued;
}
</style>
