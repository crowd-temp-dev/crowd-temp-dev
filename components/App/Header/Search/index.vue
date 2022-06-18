<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import Section from './Section/index.vue'
import ComboBox from '~/components/Base/ComboBox/index.vue'
import SearchField from '~/components/Base/SearchField/index.vue'

export default defineComponent({
  name: 'AppHeaderSearch',
  components: { ComboBox, SearchField, Section },

  setup() {
    const searchValue = ref('')

    return { searchValue }
  },
})
</script>

<template>
  <div class="w-full flex items-center justify-center">
    <ComboBox>
      <template #trigger="{ open, close }">
        <SearchField
          v-model="searchValue"
          class="w-[578px] bg-surface-neutral-disabled"
          :input-events="{
            blur: close,
            keydown: (evt) => {
              if (/ArrowDown/i.test(evt.code)) {
                open()
              }
            },
          }"
          @keydown.enter.stop
          @keydown.space.stop
          @on-input="() => (searchValue ? open() : close())"
        />
      </template>

      <template #default>
        <div
          class="py-20 px-10 rounded-[3px] shadow-5 bg-surface-default overflow-y-auto max-h-[calc(100vh-72px)] w-[578px]"
        >
          <h2 class="uppercase font-medium mb-20 px-10">Search results:</h2>

          <div class="grid gap-y-24">
            <Section
              type="tests"
              :items="[
                {
                  title: 'Merchant app test 1',
                  to: '/',
                },
                {
                  title: 'Merchant app test 2',
                  to: '/',
                },
              ]"
            />

            <Section
              type="notes"
              :items="[
                {
                  title: 'Merchant app test 1',
                  to: '/',
                  meta: {},
                },
                {
                  title: 'Merchant app test 2',
                  to: '/',
                  meta: {},
                },
              ]"
            />
          </div>
        </div>
      </template>
    </ComboBox>
  </div>
</template>
