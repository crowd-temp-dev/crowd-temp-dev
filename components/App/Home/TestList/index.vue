<script lang="ts">
import {
  defineComponent,
  computed,
  ref,
  onBeforeMount,
  nextTick,
} from '@vue/composition-api'
import TestItem from './TestItem/index.vue'
import { TestListItem } from './type'
import SearchField from '~/components/Base/SearchField/index.vue'
import Button from '~/components/Base/Button/index.vue'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'
import { uuidv4 } from '~/utils'

// const tableHead = [
//   'Favourite',
//   'Created at',
//   'Responses',
//   'Notes',
//   'Status',
//   'Action',
//   'More',
// ]

export default defineComponent({
  name: 'AppHomeTestList',
  components: { SearchField, Button, TestItem, FadeTransition },
  setup(_, { root }) {
    const filter = ref('')

    const testId = ref(uuidv4())

    const showFavouriteQuery = computed(() => root.$route.query.showFavourite)

    const showFavourite = computed(() =>
      Boolean(Number(showFavouriteQuery.value || '0'))
    )

    const testList = computed(
      () => root.$store.state['list-test'].items as TestListItem[]
    )

    const favouriteTests = computed(
      () => root.$store.getters['list-test/favourites'] as TestListItem[]
    )

    const filteredTestList = computed(() => {
      const storeItems =
        showFavourite.value && favouriteTests.value.length
          ? favouriteTests.value
          : testList.value

      if (filter.value) {
        const filteredRegExp = new RegExp(filter.value, 'i')

        return storeItems
          .filter((item) => filteredRegExp.test(item.name))
          .map((x) => {
            const searchValueRegExp = new RegExp(filter.value, 'i')
            const html = `<span class="text-text-subdued/80">${x.name.replace(
              searchValueRegExp,
              `<mark class="bg-transparent text-text-default">${filter.value}</mark>`
            )}</span>`

            return {
              ...x,
              name: html,
            }
          })
      }

      return storeItems
    })

    const getAllTests = async () =>
      await root.$store.dispatch('list-test/getAllTests')

    const toggleShowFavourite = () => {
      const nextQuery = String(Number(!showFavourite.value))

      if (showFavouriteQuery.value !== nextQuery) {
        root.$router.replace({
          query: {
            showFavourite: nextQuery,
          },
        })

        nextTick(getAllTests)
      }
    }

    onBeforeMount(getAllTests)

    return {
      testList,
      favouriteTests,
      filter,
      filteredTestList,
      showFavourite,
      toggleShowFavourite,
      testId,
    }
  },
})
</script>

<template>
  <section>
    <h3 class="text-heading font-semibold mb-8">Your tests</h3>

    <!-- header -->
    <div
      class="bg-surface-default shadow-card rounded-lg flex items-center p-10 mb-32"
    >
      <SearchField
        v-model="filter"
        placeholder="Filter"
        class="w-full border border-[#A7ACB1]"
      />

      <PButtonGroup segmented class="shrink-0 ml-8 mr-12">
        <Button disclosure="down"> All tests </Button>

        <Button disclosure="down"> Sort </Button>
      </PButtonGroup>

      <Button
        :title="
          showFavourite
            ? 'Show all'
            : `Show favourite${favouriteTests.length > 1 ? 's' : ''}`
        "
        :disabled="!favouriteTests.length"
        class="shrink-0"
        :class="{
          '!bg-action-primary-depressed text-white': !!(
            showFavourite && favouriteTests.length
          ),
        }"
        @click="toggleShowFavourite"
      >
        <div class="flex items-center">
          <PIcon
            source="StarFilledMinor"
            class="mr-6"
            :class="{ 'fill-icon': showFavourite }"
          />
          Favourites
        </div>
      </Button>
    </div>

    <!-- empty state -->
    <div v-if="!testList.length" class="text-center grid justify-items-center">
      <PImage
        source="/png/app/home/test-list/empty-state.png"
        alt="Vector illustration of an empty state"
        :width="100"
        :height="100"
        class="w-100 h-100 mb-8"
      />

      <h4 class="text-display-small font-bold mb-8">
        This is where your tests will show
      </h4>

      <h5 class="text-text-subdued mb-16">
        You can create a new product or import your product inventory.
      </h5>

      <Button primary :to="`/create-test/${testId}`"> Create new test </Button>
    </div>

    <FadeTransition>
      <TransitionGroup
        v-if="filteredTestList.length"
        class="relative w-full grid gap-y-10"
        tag="ul"
        enter-class="opacity-0"
        move-class="transition-[transform,opacity]"
        enter-active-class="transition-[transform,opacity]"
        leave-active-class="transition-[transform,opacity]"
        leave-to-class="opacity-0"
      >
        <TestItem
          v-for="(item, i) in filteredTestList"
          :key="i"
          v-bind="item"
        />
      </TransitionGroup>

      <p
        v-else-if="testList.length"
        class="font-semibold text-center text-text-subdued text-heading"
      >
        No result!
      </p>
    </FadeTransition>
  </section>
</template>

<style scoped></style>
