<script lang="ts">
import { computed, defineComponent, nextTick, ref } from '@vue/composition-api'
import Item from './Item/index.vue'

interface ItemType {
  title: string
  subtitle: string
}

export default defineComponent({
  name: 'LandinPageUseCasesList',
  components: { Item },
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  props: {
    modelValue: {
      type: Number,
      default: 0,
    },
    imageHovered: Boolean,
  },
  setup(_props, { emit }) {
    const cycled = ref(false)

    const active = computed({
      get() {
        return _props.modelValue
      },
      set(val: number) {
        emit('update:modelValue', val)
      },
    })

    const items: ItemType[] = [
      {
        title: 'Learn more about your users',
        subtitle:
          'Card sorting helps you plan and evaluate the information architecture of your website.',
      },
      {
        title: 'Validate & refine your designs',
        subtitle:
          'Card sorting helps you plan and evaluate the information architecture of your website.',
      },
      {
        title: 'Test your design prototype',
        subtitle:
          'Card sorting helps you plan and evaluate the information architecture of your website.',
      },
      {
        title: 'Optimise your message',
        subtitle:
          'Card sorting helps you plan and evaluate the information architecture of your website.',
      },
      {
        title: 'Measure satisfaction',
        subtitle:
          'Card sorting helps you plan and evaluate the information architecture of your website.',
      },
    ]

    const onProgressDone = async (index: number) => {
      if (!cycled.value) {
        active.value = index

        active.value += 1

        await nextTick()

        if (active.value > items.length - 1) {
          active.value = 0
          cycled.value = true
        }
      }
    }

    return { active, cycled, items, onProgressDone }
  },
})
</script>

<template>
  <ul>
    <Item
      v-for="(item, i) in items"
      :key="`${i}${active === i}`"
      v-bind="item"
      :active="active === i"
      :start-animation="!cycled"
      :paused="imageHovered"
      @click="active = i"
      @progress-done="onProgressDone(i)"
    />
  </ul>
</template>
