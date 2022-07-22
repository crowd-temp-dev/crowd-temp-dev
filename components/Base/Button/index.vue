<script lang="ts">
import {
  ComponentInstance,
  computed,
  defineComponent,
  onMounted,
  ref,
  watch,
} from '@vue/composition-api'
import Spinner from '../Spinner/index.vue'
import { oneFrame, sleep } from '~/utils'

export default defineComponent({
  name: 'BaseButton',
  components: { Spinner },
  props: {
    primary: Boolean,
    disabled: Boolean,
    autofocus: Boolean,
    plain: Boolean,
    destructive: Boolean,
    loading: Boolean,
    readonly: Boolean,
    label: {
      type: String,
      default: undefined,
    },
  },

  setup(_props) {
    const rootRef = ref<ComponentInstance | null>(null)

    const props = computed(() => _props)

    const autofocus = () => {
      if (props.value.autofocus) {
        sleep(oneFrame).then(() => {
          if (rootRef.value?.$el) {
            ;(rootRef.value.$el as HTMLElement).focus()
          }
        })
      }
    }

    onMounted(autofocus)

    watch(() => props.value.autofocus, autofocus)

    return { rootRef }
  },
})
</script>

<template>
  <PButton
    ref="rootRef"
    v-bind="$attrs"
    :plain="plain"
    :inert="readonly || disabled || loading || undefined"
    :type="readonly ? 'button' : $attrs.type || 'button'"
    :aria-readonly="readonly || loading || undefined"
    :tabindex="`${disabled || loading || readonly ? -1 : $attrs.tabindex || 0}`"
    :disabled="disabled || undefined"
    :primary="false"
    class="BaseButton"
    :class="{
      Primary: primary,
      Destructive: destructive,
      'pointer-events-none': loading || readonly,
      'grayscale !opacity-50': disabled,
    }"
    :connected-disclosure="undefined"
    :destructive="destructive"
    :loading="false"
    v-on="$listeners"
    @keydown.native="(e) => $emit('keydown', e)"
    @keyup.native="(e) => $emit('keyup', e)"
    @keypress.native="(e) => $emit('keypress', e)"
    @focus.native="(e) => $emit('focus', e)"
    @blur.native="(e) => $emit('blur', e)"
    @mouseenter.native="(e) => $emit('mouseenter', e)"
    @mouseleave.native="(e) => $emit('mouseleave', e)"
    @mouseout.native="(e) => $emit('mouseout', e)"
    @mouseover.native="(e) => $emit('mouseover', e)"
  >
    <span
      v-if="($slots.default && $slots.default.length) || label"
      class="transition-opacity"
      :class="{
        'opacity-0 cursor-default': loading,
      }"
    >
      <slot>
        <template v-if="label">
          {{ label }}
        </template>
      </slot>
    </span>

    <div
      v-if="loading"
      class="flex-centered absolute h-full w-full inset-0 text-[24px] fade-appear"
      :class="{ 'text-icon-default': !primary && !destructive && !plain }"
    >
      <Spinner />
    </div>
  </PButton>
</template>

<style scoped lang="postcss">
.BaseButton {
  @apply !transition-[color,background-color,opacity,transform] !duration-[250ms] active:opacity-80 transform-gpu active:scale-[0.99] md:active:scale-[0.992];
  transition-timing-function: cubic-bezier(0.18, 0.89, 0.32, 1.28);
  appearance: none;
}

.Primary:not(.Polaris-Button--plain) {
  @apply !bg-action-primary-default hover:bg-action-primary-hovered  active:bg-action-primary-depressed !text-text-on-primary;
}

.Destructive:not(.Polaris-Button--plain) {
  @apply bg-interactive-critical hover:bg-interactive-critical-hovered text-text-on-primary active:bg-interactive-critical-depressed after:ring-interactive-critical focus:after:ring-2;
}

.Primary.Polaris-Button >>> svg {
  fill: white;
}
</style>
