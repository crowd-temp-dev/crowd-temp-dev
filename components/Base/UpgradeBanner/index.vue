<template>
  <FadeTransition :duration="transitionDuration">
    <div v-if="showBanner">
      <PBanner title="Upgrade required" status="warning" @dismiss="closeBanner">
        You need to upgrade to the Pro plan or higher to allow you add a max of
        2 team members. Additional team members cost $12 per seat

        <div class="mt-20 flex items-center">
          <Button> Upgrade to pro </Button>

          <Button plain-action class="underline !bg-transparent !border-none">
            See more plans
          </Button>
        </div>
      </PBanner>
    </div>
  </FadeTransition>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import Button from '~/components/Base/Button/index.vue'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'
import { sleep } from '~/utils'

export default defineComponent({
  name: 'BaseUpgradeBanner',
  components: { FadeTransition, Button },
  emits: ['dismissed'],
  setup(_, { emit }) {
    const showBanner = ref(true)

    const transitionDuration = 200

    const closeBanner = async () => {
      showBanner.value = false

      await sleep(transitionDuration - 16)

      if (!showBanner.value) {
        emit('dismissed')
      }
    }

    return { showBanner, closeBanner, transitionDuration }
  },
})
</script>

<style scoped></style>
