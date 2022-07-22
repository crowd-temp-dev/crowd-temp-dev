<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api'
import Button from '@/components/Base/Button/index.vue'

export default defineComponent({
  name: 'BaseSearchField',
  components: { Button },
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: 'Search',
    },
    outlined: Boolean,
    inputEvents: {
      type: Object as () => Record<string, Function>,
      default: () => ({}),
    },
  },
  emits: ['update:modelValue', 'on-input'],

  setup(_props, { emit }) {
    const modelSync = computed({
      get() {
        return _props.modelValue
      },

      set(val: string) {
        if (typeof val === 'string') {
          emit('update:modelValue', val)

          emit('on-input')
        }
      },
    })

    return { modelSync }
  },
})
</script>

<template>
  <form
    action="."
    class="rounded relative isolate h-36 focus-within:ring-2 ring-action-primary-default ring-offset-2 transition-shadow"
    :class="{
      'border border-divider': outlined,
    }"
    @submit.prevent
    v-on="$listeners"
  >
    <div
      class="w-20 h-20 ml-12 absolute top-[50%] translate-y-[-50%] flex items-center justify-center pointer-events-none"
    >
      <PIcon
        source="SearchMajor"
        class="text-icon-default fill-icon w-16 h-16"
      />
    </div>
    <input
      v-model="modelSync"
      type="search"
      :placeholder="placeholder"
      spellcheck="false"
      class="bg-transparent h-[inherit] w-full pl-40 outline-none border-none appearance-none input placeholder:text-text-subdued placeholder:text-body pr-36"
      v-on="inputEvents"
    />

    <Transition name="fade-transition" mode="out-in">
      <Button
        v-if="modelSync.length"
        plain-action
        title="Clear"
        class="text-icon-default fill-icon absolute right-0 top-0 h-full w-36 p-0"
        @click="modelSync = ''"
      >
        <PIcon source="MobileCancelMajor" class="fill-[#878787]" />
      </Button>
    </Transition>
  </form>
</template>

<style scoped>
.input::-ms-clear {
  display: none;
}

.input::-webkit-search-decoration,
.input::-webkit-search-cancel-button {
  -webkit-appearance: none;
}
</style>
