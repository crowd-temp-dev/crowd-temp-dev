<script lang="ts">
import {
  computed,
  defineComponent,
  ref,
  onMounted,
  watch,
} from '@vue/composition-api'
import type { Placement } from '@popperjs/core'

import ComboBox from '../ComboBox/index.vue'
import type { DropdownOption } from '../Dropdown/index.vue'
import {
  uid,
  pseudoFocusOnMouseEnter,
  pseudoFocus,
  sleep,
  oneFrame,
  debounce,
} from '~/utils'
import eventKey from '~/utils/eventKey'

export type SelectOption = {
  label: string
  value: string
  disabled?: boolean
}

interface SelfDropdownOption extends DropdownOption {
  id: string
  value: string
}

export default defineComponent({
  name: 'BaseSelect',
  components: { ComboBox },
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  props: {
    maxVisibleItems: {
      type: Number,
      default: 8,
    },
    placeholder: {
      type: String,
      default: undefined,
    },
    label: {
      type: String,
      default: undefined,
    },
    boldLabel: Boolean,
    maxWidth: {
      type: String as () => `${number}${'px' | 'rem' | 'em' | '%'}`,
      default: '700px',
    },
    options: {
      type: Array as () => SelectOption[],
      required: true,
    },
    modelValue: {
      type: [String, Number],
      default: undefined,
    },
    disabled: Boolean,
    required: Boolean,
    show: Boolean,
    placement: {
      type: String as () => Placement,
      default: 'bottom',
    },
    id: {
      type: String,
      default: undefined,
    },
    mandatory: Boolean,
    error: {
      type: String,
      default: undefined,
    },
    value: {
      type: String,
      default: undefined,
    },
    wrapperClass: {
      type: String,
      default: undefined,
    },
    hidePreview: Boolean,
    contentClass: {
      type: String,
      default: '',
    },
  },
  setup(_props, { emit, root }) {
    const triggerRefSelector = ref(uid())

    const getId = computed(() => _props.id || uid('select-'))

    const props = computed(() => _props)

    const manualModel = ref(_props.mandatory ? _props.value : '')

    const contentRef = ref<HTMLElement | null>(null)

    const textInputRef = ref<HTMLInputElement>()

    const searchField = ref({
      value: '',
      timeStamp: 0,
    })

    const modelSync = computed({
      get() {
        if (/string|number/.test(typeof _props.modelValue)) {
          return _props.modelValue
        }

        return manualModel.value
      },
      set(val: string) {
        if (/string|number/.test(typeof _props.modelValue)) {
          emit('update:modelValue', `${val}`)
        }

        manualModel.value = val
      },
    })

    const getLabel = computed<string>(() => {
      const selected = _props.options.find(
        (option) => option.value === `${modelSync.value}`
      )

      return selected ? selected.label : ''
    })

    const dropdownOptions = computed<SelfDropdownOption[]>(() => {
      return _props.options.map(
        (option) =>
          ({
            title: option.label,
            disabled: option.disabled,
            selected: `${modelSync.value}` === option.value,
            onClick: () => {
              modelSync.value = option.value
            },
            value: option.value,
            id: `${getId.value}-${option.value}`.replace(/\s+/g, '-'),
          } as SelfDropdownOption)
      )
    })

    const timeout = ref<NodeJS.Timeout | null>()

    const onInput = (evt: InputEvent, active: boolean) => {
      timeout.value && clearTimeout(timeout.value)

      const { timeStamp } = evt

      if (timeStamp - searchField.value.timeStamp >= 500) {
        searchField.value.value = ''
      }

      if (evt.data) {
        const canAddSearch = evt.data === ' ' ? !!searchField.value.value : true

        if (canAddSearch) {
          searchField.value.value += evt.data

          searchField.value.timeStamp = timeStamp

          // focus on option that matches
          const matchingOption = dropdownOptions.value.find((item) =>
            item.title
              .toLowerCase()
              .startsWith(searchField.value.value.toLowerCase())
          )

          if (matchingOption && active) {
            const foundOptionEl = document.getElementById(matchingOption.id)

            if (foundOptionEl) {
              pseudoFocus(foundOptionEl)
            }
          } else if (matchingOption) {
            console.log(matchingOption.value)

            modelSync.value = matchingOption.value

            emitFormChange()
          }

          timeout.value = setTimeout(() => {
            searchField.value.value = ''

            timeout.value = null
          }, 650) as unknown as NodeJS.Timeout
        }
      }
    }

    const emitFormChange = () => {
      if (!_props.disabled && modelSync.value && textInputRef.value?.form) {
        textInputRef.value.form.dispatchEvent(new Event('change'))
      }
    }

    const selectPreviousOrNext = (
      active: boolean,
      which: 'previous' | 'next'
    ) => {
      if (active) {
        return
      }

      const values = _props.options

      const currentIndex = values.findIndex(
        (option) => option.value === `${modelSync.value}`
      )

      const nextIndex = which === 'next' ? currentIndex + 1 : currentIndex - 1

      const nextValue = values[nextIndex]

      if (nextValue && !nextValue.disabled) {
        modelSync.value = nextValue.value

        emitFormChange()
      }
    }

    const labelOnKeydown = (
      evt: KeyboardEvent,
      active: boolean,
      open: () => void,
      close: () => void
    ) => {
      const key = eventKey(evt)

      if (active) {
        if (key === 'tab') {
          return evt.preventDefault()
        }

        if (key === 'esc') {
          evt.stopPropagation()

          return close()
        }

        if (['space', 'enter'].includes(key)) {
          if (key === 'space' && searchField.value.value) {
            return
          }

          evt.preventDefault()

          if (contentRef.value) {
            const currentPseudoFocus = contentRef.value.querySelector(
              '.pseudo-focus[data-pseudo-focus]'
            ) as HTMLElement

            if (currentPseudoFocus && currentPseudoFocus.dataset.value) {
              modelSync.value = currentPseudoFocus.dataset.value
            }
          }

          return
        }

        if (['arrow_down', 'arrow_up'].includes(key)) {
          searchField.value.value = ''
        }
      } else {
        if (key === 'space' && !searchField.value.value) {
          return open()
        }

        if (['arrow_down', 'arrow_up'].includes(key)) {
          selectPreviousOrNext(
            active,
            key === 'arrow_down' ? 'next' : 'previous'
          )
        }
      }
    }

    const focusOnInput = () => {
      if (root.$breakpoint.isMobile) {
        return
      }

      requestAnimationFrame(() => {
        const input = document.getElementById(getId.value)

        if (input) {
          input.focus()
        }
      })
    }

    const scrollToSelected = () => {
      sleep(oneFrame * 2).then(() => {
        if (contentRef.value) {
          const selected = contentRef.value.querySelector(
            '.pseudo-focus[data-selected]'
          ) as HTMLElement

          if (selected) {
            selected.scrollIntoView({
              block: 'center',
            })
          }
        }
      })
    }

    const closeOnBlur = (close: () => void) => {
      debounce(emitFormChange, 100)()

      close()
    }

    watch(
      () => props.value.options,
      (nv) => {
        if (!nv.find((option) => option.value === `${modelSync.value}`)) {
          modelSync.value = ''

          emitFormChange()
        }
      }
    )

    onMounted(() => {
      if ((_props.mandatory && !modelSync.value) || _props.value) {
        modelSync.value = _props.value
      }
    })

    return {
      modelSync,
      textInputRef,
      getId,
      dropdownOptions,
      getLabel,
      searchField,
      contentRef,
      triggerRefSelector,
      onInput,
      focusOnInput,
      labelOnKeydown,
      scrollToSelected,
      pseudoFocusOnMouseEnter,
      closeOnBlur,
    }
  },
})
</script>

<template>
  <div :class="{ 'flex items-center space-x-8': boldLabel }">
    <label
      v-if="label"
      :for="getId"
      :class="{
        'mb-4 inline-block': !boldLabel,
        'shrink-0 uppercase text-text-subdued text-sub-heading font-semibold':
          boldLabel,
      }"
    >
      {{ label }}
    </label>

    <ComboBox
      block-click
      use-trigger-width
      enter-delay="64ms"
      enter-duration="1ms"
      restore-focus
      leave-duration="100ms"
      :loop-tabbing="false"
      :disabled="disabled"
      :offset="[0, 5]"
      :placement="placement"
      :show="show"
      :max-width="maxWidth"
      :click-on-space-key-press="!searchField.value"
      :trigger-ref-selector="`#${triggerRefSelector}`"
      class="w-full"
      :class="wrapperClass"
      @active:true="scrollToSelected"
    >
      <template #trigger="{ open, close, active }">
        <div>
          <label
            :id="triggerRefSelector"
            :for="getId"
            class="rounded h-36 flex items-center justify-between transition-all bg-surface-default border border-[#BABFC3] shadow-1 pl-[1.2rem] pr-[0.8rem] cursor-pointer active:scale-[0.995] lg:active:scale-[0.9975] hover:bg-surface-hovered active:bg-surface-pressed focus-within:ring-2 ring-offset-1 ring-action-primary-default"
            :class="[
              contentClass,
              {
                'pointer-events-none opacity-80': disabled,
              },
            ]"
            @keydown="(evt) => labelOnKeydown(evt, active, open, close)"
          >
            <span class="flex-grow relative h-full w-full flex items-center">
              <slot v-if="getLabel" name="prepend" />

              <slot name="preview">
                {{ getLabel }}
              </slot>

              <slot v-if="getLabel" name="append" />

              <span
                v-if="placeholder && !getLabel"
                class="absolute inset-0 text-text-subdued h-full w-full inline-flex items-center"
              >
                {{ placeholder }}
              </span>

              <input
                :id="getId"
                ref="textInputRef"
                :tabindex="$appState.strictTouch ? '-1' : '0'"
                :placeholder="placeholder"
                :value="modelSync"
                :required="required || undefined"
                autocomplete="nope"
                class="sr-only left-[50%] top-[50%]"
                @click="open"
                @input="(evt) => onInput(evt, active)"
                v-on="
                  active
                    ? {
                        blur: () => closeOnBlur(close),
                      }
                    : undefined
                "
              />
            </span>

            <PIcon
              source="SelectMinor"
              class="fill-icon-default transition-opacity shrink-0"
              :class="{ 'opacity-60': disabled }"
            />
          </label>

          <PInlineError
            v-if="error"
            class="mt-[.4rem]"
            :message="error"
            :field-i-d="id"
          />
        </div>
      </template>

      <template #default>
        <menu
          ref="contentRef"
          :data-value="modelSync"
          class="p-4 shadow-3 rounded-lg bg-surface-default overflow-y-auto"
          :style="{ maxHeight: `${maxVisibleItems * 28}px` }"
        >
          <li
            v-for="option in dropdownOptions"
            :id="option.id"
            :key="option.value"
            :data-pseudo-focus="option.selected"
            :data-selected="option.selected"
            :data-disabled="option.disabled || undefined"
            :data-value="option.value"
            class="flex items-center pl-4 pr-16 h-28 cursor-pointer pseudo-focus rounded"
            :class="{ 'font-medium': option.selected }"
            @mouseenter="pseudoFocusOnMouseEnter"
            @mousedown="
              () => {
                option.onClick()

                focusOnInput()
              }
            "
            @click="
              () => {
                modelSync && option.onClick()
              }
            "
          >
            <div class="w-20 mr-2">
              <PIcon
                v-if="option.selected"
                source="TickSmallMinor"
                class="fill-icon"
              />
            </div>

            <span>
              {{ option.title }}
            </span>
          </li>
        </menu>
      </template>
    </ComboBox>
  </div>
</template>

<style scoped lang="postcss">
.pseudo-focus[data-pseudo-focus]:not([data-disabled]) {
  @apply !bg-action-primary-hovered !text-white active:scale-[0.995] transition-transform transform-gpu;
}

.pseudo-focus[data-pseudo-focus][data-selected]:not([data-disabled]) {
  @apply !bg-action-primary-depressed !text-white fill-white;
}
</style>
