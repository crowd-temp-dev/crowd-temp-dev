<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import Onboard from './Onboard/index.vue'
import TestList from './TestList/index.vue'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'

export default defineComponent({
  name: 'AppLayoutMarkup',
  components: { Onboard, TestList, FadeTransition },
  setup() {},
})
</script>

<template>
  <div class="h-full isolate lg:px-0 px-32 w-full">
    <div class="pt-32 pb-112 isolate max-w-app mx-auto">
      <FadeTransition>
        <Onboard v-if="$user.showDashboardGuide" />
      </FadeTransition>

      <TestList />
    </div>
  </div>
</template>
