<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api'
import { FeatureTitle } from '~/types'
import { features } from '~/utils'

export default defineComponent({
  name: 'LandingPageFeatureItem',
  components: {},
  props: {
    title: {
      type: String as () => FeatureTitle,
      default: undefined,
    },
  },
  setup(_props) {
    const props = computed(() => _props)

    const content = computed(() => features[props.value.title])

    return { content }
  },
})
</script>

<template>
  <li class="FeatureItem">
    <div
      class="color-frame"
      :style="{
        '--bg': content.color,
      }"
    />

    <div>
      <h4 class="text-heading font-semibold">
        {{ title }}
      </h4>

      <p class="text-body mt-8">
        {{ content.subtitle }}
      </p>
    </div>
  </li>
</template>

<style scoped lang="postcss">
.FeatureItem {
  @apply bg-[#FAFAFA] rounded-[5px] p-10 w-full md:w-370 inline-flex items-start md:h-92 transition-transform shadow-divide-bottom;
}
.color-frame {
  background-color: var(--bg);
  @apply w-28 h-28 rounded-full mr-8 shrink-0;
}
</style>
