<script lang="ts">
import { defineComponent, nextTick, ref, watch } from '@vue/composition-api'
import TrapFocus from 'ui-trap-focus'
import Button from '@/components/Base/Button/index.vue'
import {
  features,
  layoutSizing,
  newTestConstructor,
  scrollMain,
  sleep,
} from '~/utils'
import eventKey from '~/utils/eventKey'
import { FeatureContent } from '~/types'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'

export default defineComponent({
  name: 'AppCreateTestStepsAddNewBlock',
  components: { Button, FadeTransition },
  props: {
    showOptions: Boolean,
    // used to set the index value when commiting a new section.
    // basically helps to insert a new section at a particular point
    sectionIndex: {
      type: Number,
      default: undefined,
    },
    id: {
      type: String,
      default: undefined,
    },
  },
  setup(_props, { root: { $store: store } }) {
    const helper = ref<HTMLElement | null>(null)

    const showHelper = ref(_props.showOptions)

    const showHelperDirtied = ref(false)

    const pingBtn = ref(false)

    watch(
      () => showHelper.value,
      (nv) => {
        showHelperDirtied.value = true

        if (nv) {
          sleep(250).then(() => {
            helper.value &&
              scrollMain(helper.value.offsetTop - layoutSizing.allSizes)
          })
        }
      }
    )

    const arrowFocus = (evt: KeyboardEvent) => {
      const key = eventKey(evt)

      if (key.startsWith('arrow')) {
        evt.preventDefault()

        if (/_right|_down/.test(key)) {
          const trapFocus = new TrapFocus({
            steps: key === 'arrow_down' ? 1 : undefined,
          })

          trapFocus.forward(evt)
        } else if (/_left|_up/.test(key)) {
          const trapFocus = new TrapFocus({
            steps: key === 'arrow_up' ? 1 : undefined,
          })

          trapFocus.backward(evt)
        }
      }
    }

    const createTest = async (feature: FeatureContent) => {
      const { createTestComponent } = feature

      const newTest = newTestConstructor(createTestComponent)

      const questionsValues = Object.entries(store.state['create-test'].form)
        .filter((entry) => {
          return /^question-\d+$/.test(entry[0])
        })
        .map((entry) => entry[1])

      const newIndex = _props.sectionIndex || 0

      const newQuestionsEntries = [
        ...questionsValues.slice(0, newIndex),
        newTest,
        ...questionsValues.slice(newIndex),
      ].map((value, index) => [`question-${index + 1}`, value])

      store.dispatch('create-test/updateForm', {
        value: Object.fromEntries(newQuestionsEntries),
        path: '',
      })

      showHelper.value = false

      await nextTick()

      await sleep(50)

      const newElement = document.getElementById(
        newTest.id
      ) as HTMLElement | null

      if (newElement) {
        newElement.focus({ preventScroll: true })

        scrollMain(newElement.offsetTop - layoutSizing.allSizes)
      }
    }

    const togglePingBtn = () => {
      pingBtn.value = !pingBtn.value
    }

    const focusOnFeatures = (evt: MouseEvent) => {
      ;(evt.currentTarget as HTMLButtonElement).focus({ preventScroll: true })
    }

    return {
      showHelper,
      features,
      showHelperDirtied,
      pingBtn,
      helper,
      arrowFocus,
      createTest,
      togglePingBtn,
      focusOnFeatures,
    }
  },
})
</script>

<template>
  <Transition name="fade-transition" mode="out-in">
    <div
      v-if="showHelper"
      :id="id"
      ref="helper"
      class="w-full max-w-[800px] bg-surface-default rounded-lg p-20 shadow-2 my-32 mb-12"
      :style="{
        '--fade-enter-duration': '150ms',
        '--fade-leave-duration': '10ms',
      }"
      @keydown.esc="showHelper = false"
    >
      <h3
        class="flex items-center justify-between font-semibold text-heading mb-32"
      >
        Add a block

        <Button :id="id" @click="showHelper = false"> Close </Button>
      </h3>

      <ul class="grid gap-20 grid-cols-2" @keydown="arrowFocus">
        <li v-for="(feature, key, index) in features" :key="key">
          <button
            v-autofocus="index === 0"
            type="button"
            class="flex p-10 outline-none focus:ring-2 ring-action-primary-default ring-offset-2 rounded select-none isolate fill-before before:bg-current before:-z-1 before:opacity-0 before:transition-opacity hover:before:opacity-5 active:before:opacity-10 relative text-left focus:before:opacity-5 before:!transition-none transition-transform active:scale-[0.9975] transform-gpu"
            @click="createTest({ ...feature })"
            @mouseenter="focusOnFeatures"
          >
            <div
              class="w-28 h-28 rounded-full feature-item-bg shrink-0"
              :style="{ '--bg': feature.color }"
            />

            <div class="ml-8 flex-grow">
              <p class="text-heading font-semibold mb-8">
                {{ key }}
              </p>

              <p class="text-body">
                {{ feature.subtitle }}
              </p>
            </div>
          </button>
        </li>
      </ul>
    </div>

    <div
      v-else
      :id="id"
      key="cta"
      class="flex items-center w-full before:w-full after:w-full before:h-1 after:h-1 before:block after:block before:border-b after:border-b before:border-[#ccc] after:border-[#ccc] before:border-dashed after:border-dashed pointer-events-none mt-20"
      :style="{
        '--fade-enter-duration': '10ms',
      }"
    >
      <FadeTransition>
        <div
          v-if="$createTestForm.questions.length < 50"
          class="relative shrink-0 mx-10"
        >
          <Button
            primary
            class="pointer-events-auto"
            :disabled="$store.state['create-test'].submitting"
            @click="showHelper = true"
          >
            Add new block
          </Button>

          <div
            v-if="pingBtn"
            class="pseudo ring-2 ring-action-primary-default ring-offset-1 !rounded ping-btn"
            @animationend="pingBtn = false"
          />
        </div>
      </FadeTransition>
    </div>
  </Transition>
</template>

<style scoped>
.feature-item-bg {
  background-color: var(--bg);
}

@keyframes ping-btn {
  75%,
  100% {
    transform: scale3d(1.15, 1.25, 1);
    opacity: 0;
  }
}
.ping-btn {
  animation: ping-btn 1s cubic-bezier(0, 0, 0.2, 1);
}
</style>
