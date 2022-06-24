import { ChangePasswordForm } from '~/server-middleware/routes/user/change-password'
import { DeleteAccountForm } from '~/server-middleware/routes/user/delete-account'
import { MessageObject, UserData } from '~/server-middleware/types'

import { LoginPayload, UserInfo } from '~/store/user'

export type UserRole = 'tester' | 'user'

export interface ApiResponse<Data> {
  data?: Data
  error?: any
  status: number
  message: MessageObject[]
}

export interface User extends UserInfo {
  loggedIn: boolean
  initials: string
  login: (arg: LoginPayload) => Promise<ApiResponse<UserInfo>>
  logout: (alert?: boolean) => Promise<[]>
  update: (arg: UserData) => Promise<ApiResponse<UserInfo>>
  reload: () => Promise<ApiResponse<UserInfo>>
  delete: (arg: DeleteAccountForm) => Promise<ApiResponse<[]>>
  changePassword: (arg: ChangePasswordForm) => Promise<ApiResponse<UserInfo>>
}

export type DynamicObject<value> = Record<string, value>

export type Breakpoints = 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'

export type BreakpointOutput = {
  is?: Breakpoints
  orientation?: 'portrait' | 'landscape' | ''
  isMobile?: boolean
}

export interface HTMLAttrs {
  lang: 'en'
  class: string
}

export type HTMLFormInput =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement

export type Layout = 'landing-page' | 'app' | 'error' | 'answer-test' | 'action'

export type FeatureTitle =
  | 'Simple survey'
  | 'Card sorting'
  | 'Design Survey'
  | 'Five second test'
  | 'Website evaluation'
  | 'Prototype evaluation'
  | 'Preference test'
  | 'Custom message'

export type CreateTestTypes =
  | 'DesignSurvey'
  | 'PreferenceTest'
  | 'FiveSecondsTest'
  | 'PrototypeEvaluation'
  | 'WebsiteEvaluation'
  | 'SimpleSurvey'
  | 'ClickTest'
  | 'CardSorting'
  | 'CustomMessage'

export type CreateTestComponent =
  | 'TestDetails'
  | 'WelcomeScreen'
  | CreateTestTypes

export interface FeatureContent {
  color: string
  subtitle: string
  createTestComponent: CreateTestComponent
}

export type Feature = {
  [key in FeatureTitle]: FeatureContent
}

export interface OnSubmitArgs<Form> {
  formValues: Form
  formFields: Record<keyof Form, HTMLSelectElement | HTMLInputElement>
  formElement: HTMLFormElement
  toggleLoading: (val?: boolean) => void
  refreshForm: () => void
}

export type OnSubmit<Form> = (arg: OnSubmitArgs<Form>) => Promise<void> | void

export interface FullscreenLoading {
  show: (arg: {
    message: string
    delay?: number
    duration?: number
    id?: string
    fadeAppear?: boolean
  }) => Promise<boolean>
  hide: (arg?: { id?: string }) => Promise<boolean>
}

export type Duration = `${number}${'ms' | 's'}`

export type LikeNumber = `${number}` | number

export interface VueElement extends HTMLElement {
  __vue__: Record<string, any>
}

export type ApiAction =
  | 'end_all_sessions'
  | 'confirm_account'
  | 'change_email'
  | 'cancel_email_change'

export type FiveSecondsTestDurations =
  | 5000
  | 10000
  | 15000
  | 20000
  | 25000
  | 30000
  | 45000
  | 60000
