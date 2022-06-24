<script lang="ts">
import { defineComponent, onMounted } from '@vue/composition-api'
import { OnSubmitArgs } from '~/types'

export default defineComponent({
  name: 'AppCreateTestStepsForm',

  props: {
    hideSubmit: Boolean,
    name: {
      type: String,
      required: true,
    },
    initialValue: {
      type: Object,
      default: undefined,
    },
  },

  emits: ['on-submit'],

  setup(_props, { emit, root: { $createTestForm, $store } }) {
    const onSubmit = (payload: OnSubmitArgs<Record<string, any>>) => {
      emit('on-submit', payload)

      const allForms = Array.from(
        document
          .getElementById('create-test-form-wrapper')
          ?.querySelectorAll('.FormLayout') || []
      )

      if (allForms.length) {
        // scroll to next form
        const { formElement } = payload

        const nextFormIndex = allForms.indexOf(formElement) + 1

        const nextForm = allForms[nextFormIndex]

        if (nextForm instanceof HTMLFormElement) {
          nextForm.dispatchEvent(
            new Event('submit', {
              bubbles: true,
              cancelable: true,
            })
          )
        }
      }
    }

    onMounted(() => {
      // @ts-ignore
      if (!$createTestForm[_props.name] && _props.initialValue) {
        $store.dispatch('create-test/updateForm', {
          path: _props.name,
          value: {
            ..._props.initialValue,
          },
        })
      }
    })

    return { onSubmit }
  },
})
</script>

<template>
  <FormLayout v-slot="slotProps" :name="name" @on-submit="onSubmit">
    <slot
      v-bind="{
        ...slotProps,
        setup: (fieldName) => {
          return {
            ...slotProps.fieldIdAndError(`${name}_${fieldName}`),
            modelValue: ($createTestForm[name] || {})[fieldName],
            updateModelValue: (val) => {
              $store.dispatch('create-test/updateForm', {
                path: `${name}.${fieldName}`,
                value: val,
              })
            },
          }
        },
        setupEvents: (fieldName) => {
          return {
            'update:modelValue': (val) => {
              $store.dispatch('create-test/updateForm', {
                path: `${name}.${fieldName}`,
                value: val,
              })
            },
          }
        },
      }"
    />

    <input v-if="!hideSubmit" type="submit" value="Submit" tabindex="-1" class="sr-only" />
  </FormLayout>
</template>
