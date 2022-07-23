<script lang="ts">
import {
  computed,
  defineComponent,
  nextTick,
  ref,
  watch,
} from '@vue/composition-api'
import TrapFocus from 'ui-trap-focus'
import Button from '@/components/Base/Button/index.vue'
import {
  features,
  layoutSizing,
  newProjectConstructor,
  scrollMain,
  sleep,
} from '~/utils'
import eventKey from '~/utils/eventKey'
import { FeatureContent } from '~/types'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'
import { RootState } from '~/store'

export default defineComponent({
  name: 'AppProjectStepsAddNewTest',
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

    const testQuestionsLength = computed(() => {
      return (store.state as RootState).projectSuite.create.section.items.length
    })

    const showWarningBanner = computed(() => {
      return (store.state as RootState).projectSuite.create.showWarning
    })

    const testSubmitting = computed(() => {
      return (store.state as RootState).projectSuite.create.submitting
    })

    watch(
      () => showHelper.value,
      (nv) => {
        showHelperDirtied.value = true

        if (nv) {
          sleep(272).then(() => {
            helper.value &&
              scrollMain(helper.value.offsetTop - layoutSizing.layoutPadding)
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

    const createProject = async (feature: FeatureContent) => {
      const { projectComponent } = feature

      const newTest = newProjectConstructor(projectComponent)

      store.commit('projectSuite/create/section/add', {
        data: newTest,
        index: _props.sectionIndex,
      })

      await nextTick()

      showHelper.value = false

      await sleep(150)

      const newElement = document.getElementById(
        newTest.id
      ) as HTMLElement | null

      if (newElement) {
        newElement.focus({ preventScroll: true })

        scrollMain(newElement.offsetTop - layoutSizing.layoutPadding)
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
      testQuestionsLength,
      showWarningBanner,
      testSubmitting,
      arrowFocus,
      createProject,
      togglePingBtn,
      focusOnFeatures,
    }
  },
})
</script>

<template>
  <FadeTransition :duration="{ leave: showHelper ? 150 : 1 }">
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
        Add a test

        <Button :id="id" @click="showHelper = false"> Close </Button>
      </h3>

      <ul class="grid gap-20 grid-cols-2" @keydown="arrowFocus">
        <li v-for="(feature, key, index) in features" :key="key">
          <button
            v-autofocus="index === 0"
            type="button"
            class="flex p-10 outline-none focus:ring-2 ring-action-primary-default ring-offset-2 rounded select-none isolate fill-before before:bg-current before:-z-1 before:opacity-0 before:transition-opacity hover:before:opacity-5 active:before:opacity-10 relative text-left focus:before:opacity-5 before:!transition-none transition-transform active:scale-[0.9975] transform-gpu"
            @click="createProject({ ...feature })"
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
        <div v-if="testQuestionsLength < 50" class="relative shrink-0 mx-10">
          <Button
            primary
            :class="{ 'pointer-events-auto': !showWarningBanner }"
            :disabled="testSubmitting"
            @click="showHelper = true"
          >
            Add new test
          </Button>

          <div
            v-if="pingBtn"
            class="pseudo ring-2 ring-action-primary-default ring-offset-1 !rounded ping-btn"
            @animationend="pingBtn = false"
          />
        </div>
      </FadeTransition>
    </div>
  </FadeTransition>
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
