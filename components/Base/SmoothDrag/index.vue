<template>
  <Draggable v-model="modelSync" v-bind="props" @start="onStart" @end="onEnd">
    <TransitionGroup
      type="transition"
      :name="!drag ? 'flip-list' : null"
      :tag="groupTag"
      :class="groupClass"
    >
      <slot :props="{ drag: drag }" />
    </TransitionGroup>
  </Draggable>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api'
import Draggable from 'vuedraggable'

export default defineComponent({
  name: 'BaseSmoothDrag',
  components: { Draggable },
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  props: {
    modelValue: {
      type: Array as () => any[],
      default: () => [],
    },
    list: {
      type: Array as () => any[],
      default: undefined
    },
    transitionName: {
      type: String,
      default: undefined,
    },
    rootTag: {
      type: String as () => keyof HTMLElementTagNameMap,
      default: 'div',
    },
    groupTag: {
      type: String as () => keyof HTMLElementTagNameMap,
      default: 'div',
    },
    animation: {
      type: Number,
      default: 200,
    },
    group: {
      type: String,
      default: undefined,
    },
    disabled: Boolean,
    ghostClass: {
      type: String,
      default: undefined,
    },
    handle: {
      type: String,
      default: '.drag-handle',
    },
    groupClass: {
      type: [String, Array, Object],
      default: undefined,
    },
  },
  emits: ['drag-start', 'drag-end'],
  setup(_props, { emit }) {
    const modelSync = computed({
      get() {
        return _props.modelValue
      },
      set(val) {
        emit('update:modelValue', val)
      },
    })

    const drag = ref(false)

    const props = computed(() => _props)

    const onStart = () => {
      drag.value = true
      emit('drag-start')
    }

    const onEnd = (evt: CustomEvent) => {
      drag.value = false
      emit('drag-end', evt)
    }

    return { modelSync, drag, props, onStart, onEnd }
  },
})
</script>

<style scoped lang="postcss">
.flip-list-move {
  transition: transform 0.5s;
  transition-timing-function: cubic-bezier(0.18, 0.89, 0.32, 1.28);
}

.no-move {
  transition: transform 0s;
}
</style>
