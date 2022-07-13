import Vue from 'vue'
// eslint-disable-next-line import/named
import { MutationTree } from 'vuex'
import { CreateTestState, freshForm } from '.'
import { getObjectPathValue } from '~/utils'

const mutations: MutationTree<CreateTestState> = {
  setId(state, id: string | null) {
    state.details.id = id
  },

  setPublishing(state, val: boolean) {
    state.publishing = val
  },

  updateDetails(
    state,
    payload: {
      data: CreateTestState['details']
      override?: boolean
    }
  ) {
    const id = state.details.id

    const newValue = {
      ...(payload.override ? {} : state.details),
      ...payload.data,
    }

    state.details = {
      ...newValue,
      id,
    }

    state.publishing = false

    state.loading = false

    state.pageLoading = false
  },

  updateForm(
    state,
    payload: {
      path: string
      value: any
      override?: boolean
    }
  ) {
    if (payload) {
      const splitPath = payload.path.split('.')

      if (payload.path) {
        if (state.form.empty) {
          let oldValue = getObjectPathValue(payload.path, state.form)

          if (typeof oldValue === 'string') {
            oldValue = oldValue.trim()
          }

          const newValue =
            typeof payload.value === 'string'
              ? payload.value.trim()
              : payload.value

          state.form.empty = oldValue === newValue
        }

        const path = splitPath.splice(0, splitPath.length - 1).join('.')

        const newState = { ...state.form }

        Vue.set(
          getObjectPathValue(path, newState),
          splitPath.slice(-1)[0],
          payload.value
        )

        state.form = { ...newState }
      } else {
        let newFormValue = payload.override
          ? payload.value
          : {
              ...state.form,
              ...payload.value,
            }

        if (state.form.empty) {
          state.form.empty =
            JSON.stringify(state.form) === JSON.stringify(newFormValue)

          newFormValue = {
            ...newFormValue,
            empty: state.form.empty,
          }
        }

        state.form = newFormValue
      }
    }

    state.loading = false
  },

  resetForm(state) {
    state.form = freshForm()
    state.details.published = false
    state.details = {
      id: state.details.id,
      name: 'New Test',
    }
  },

  setLoading(state, val?: boolean) {
    state.loading = typeof val === 'boolean' ? val : true
  },

  setSubmitting(state, val: boolean) {
    state.submitting = val
  },

  setPageLoading(state, val?: boolean) {
    state.pageLoading = typeof val === 'boolean' ? val : true
  },

  setShowWarning(state, val: boolean) {
    state.showWarning = val
  },
}

export default mutations
