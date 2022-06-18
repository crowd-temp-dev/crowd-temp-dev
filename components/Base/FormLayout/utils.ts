import { HTMLFormInput } from "~/types"

export interface FormEl extends HTMLInputElement {
  _previousDisabled?: boolean
}

export type FormFields<Form> = Record<
  keyof Form,
  HTMLFormInput
>

export function disableFormFields<Form>(formFields: FormFields<Form>) {
  // disable form elements
  for (const field in formFields) {
    const formElem = formFields[field as keyof Form] as FormEl
    formElem._previousDisabled = formElem.disabled

    formElem.disabled = true
  }
}

export function enableFormFields<Form>(formFields: FormFields<Form>) {
  // enable form elements
  for (const field in formFields) {
    const formElem = formFields[field as keyof Form] as FormEl
    formElem.disabled = formElem._previousDisabled || false
  }
}
