<script lang="ts">
import {
  computed,
  defineComponent,
  nextTick,
  onMounted,
  ref,
} from '@vue/composition-api'
import FadeTransition from '../FadeTransition/index.vue'
import { DynamicObject, OnSubmitArgs } from '~/types'

type Form = DynamicObject<string | number | boolean>

export default defineComponent({
  name: 'BaseFormLayout',
  components: { FadeTransition },
  inheritAttrs: false,
  props: {
    name: {
      type: String,
      required: true,
    },
    watchChanges: Boolean,
  },
  emits: ['change', 'form-changed', 'form-revert', 'submit', 'on-submit'],
  setup(_props, { emit, root }) {
    const rootKey = ref(0)

    const props = computed(() => _props)

    const loading = ref(false)

    const isValid = ref(false)

    const firstInputError = ref<DynamicObject<string>>({})

    const inputErrors = ref<DynamicObject<string>>({})

    const initialValues = ref<Form | null>(props.value.watchChanges ? {} : null)

    const rootRef = ref(null)

    const formValues = ref<Form>({})

    const formChanged = computed(() => {
      if (props.value.watchChanges) {
        return (
          JSON.stringify(initialValues.value) ===
          JSON.stringify(formValues.value)
        )
      }
      return false
    })

    const getFormValues = (form: HTMLFormElement) => {
      const output: Form = {}

      const formFields: DynamicObject<HTMLInputElement | HTMLSelectElement> = {}

      if (form instanceof HTMLFormElement) {
        const keyedElements = Object.keys(
          Object.getOwnPropertyDescriptors(form.elements)
        ).filter((x) => !/^\d/.test(x))

        // loop keys and set output with the values of the field element
        for (const key of keyedElements) {
          const field = form.elements.namedItem(key) as
            | HTMLInputElement
            | HTMLSelectElement

          if (field) {
            const value =
              field.type === 'number'
                ? (field as HTMLInputElement).valueAsNumber
                : ['checkbox', 'radio', 'switch'].includes(field.type)
                ? (field as HTMLInputElement).checked
                : field.value

            output[key] = value

            formFields[key] = field
          }
        }
      }

      return {
        output,
        formFields,
      }
    }

    const setFormData = (
      form: HTMLFormElement,
      setInitial?: boolean,
      setError: boolean = true
    ) => {
      if (form instanceof HTMLFormElement) {
        isValid.value = form.checkValidity()

        formValues.value = getFormValues(form).output

        if (setInitial) {
          if (initialValues.value && setInitial) {
            initialValues.value = formValues.value
          }
        } else {
          // elements with an id attr. A good reason why id's are needed in form elements
          // filter out any key that starts with [0-9]
          // and it has an error message
          const keyedElements = Object.keys(
            Object.getOwnPropertyDescriptors(form.elements)
          ).filter(
            (x) =>
              !/^\d/.test(x) &&
              !!(
                form.elements.namedItem(x) as
                  | HTMLInputElement
                  | HTMLSelectElement
                  | HTMLTextAreaElement
              ).validationMessage
          )

          if (keyedElements[0] && setError) {
            firstInputError.value = {
              [keyedElements[0]]: (
                form.elements.namedItem(keyedElements[0]) as
                  | HTMLInputElement
                  | HTMLSelectElement
                  | HTMLTextAreaElement
              ).validationMessage,
            }
          } else {
            firstInputError.value = {}
          }

          if (setError) {
            // set error message;
            for (const key of keyedElements) {
              const input = form.elements.namedItem(key) as
                | HTMLInputElement
                | HTMLTextAreaElement
                | HTMLSelectElement

              if (input) {
                inputErrors.value[key] = input.validationMessage
              }
            }
          }
        }
      }
    }

    onMounted(() => {
      firstInputError.value = {}

      nextTick(() => {
        const form = rootRef.value as unknown as HTMLFormElement

        if (form) {
          setFormData(form, true)
        }
      })
    })

    const onChange = (evt: Event) => {
      emit('change', evt)

      const form = evt.currentTarget as HTMLFormElement

      setFormData(form, false, false)

      const initialValuesString = JSON.stringify(initialValues.value as Form)

      const currentValuesString = JSON.stringify(getFormValues(form).output)

      const formChanged = initialValuesString !== currentValuesString

      emit(formChanged ? 'form-changed' : 'form-revert')
    }

    // set loading state
    const toggleLoading = (val: boolean = !loading.value) => {
      loading.value = val
    }

    const onSubmit = async (evt: Event) => {
      if (!root.$breakpoint) {
        return
      }

      emit('submit', evt)

      if (loading.value) {
        return
      }

      const form = rootRef.value || (evt.currentTarget as HTMLFormElement)

      if (form) {
        setFormData(form)

        const invalidField = Array.from(form.elements).find(
          (el) => !(el as HTMLInputElement | HTMLSelectElement).checkValidity()
        ) as HTMLInputElement | HTMLSelectElement

        // focus first invalid element
        if (invalidField) {
          invalidField.focus({ preventScroll: true })

          requestAnimationFrame(() => {
            invalidField.scrollIntoView({
              block: 'center',
              behavior: root.$breakpoint.isMobile ? 'auto' : 'smooth',
            })
          })
        } else {
          await nextTick()

          const formValues = getFormValues(rootRef.value || form)

          emit('on-submit', {
            formValues: formValues.output,
            formFields: formValues.formFields,
            formElement: rootRef.value || form,
            toggleLoading,
            refreshForm: () => {
              rootKey.value += 0.1
            },
          } as OnSubmitArgs<Form>)
        }
      }
    }

    // to easily get id and error attrs in templates
    const fieldIdAndError = (id: string) => {
      return {
        id: `${id}`.replace(/\s/g, '-'),
        error: firstInputError.value[id] || undefined,
      }
    }

    return {
      rootKey,
      isValid,
      onChange,
      rootRef,
      onSubmit,
      inputErrors,
      firstInputError,
      fieldIdAndError,
      toggleLoading,
      loading,
      formChanged,
    }
  },
})
</script>

<template>
  <FadeTransition>
    <form
      :id="name || $attrs.id"
      :key="rootKey"
      ref="rootRef"
      :name="name"
      action="."
      novalidate
      :data-valid="isValid"
      :data-invalid="!isValid"
      class="FormLayout flex flex-col space-y-20 isolate"
      v-on="$listeners"
      @submit.prevent="onSubmit"
      @change="onChange"
    >
      <slot
        v-bind="{
          valid: isValid,
          firstInputError,
          fieldIdAndError,
          toggleLoading,
          loading,
          formChanged,
        }"
      />
    </form>
  </FadeTransition>
</template>
