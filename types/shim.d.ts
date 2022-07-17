import { NuxtCookies } from 'cookie-universal-nuxt'
import { CreateTestFormQuestion } from './form'
import { BreakpointOutput, FullscreenLoading, User } from '.'
import { AppState } from '~/store/app/state'
import { TestSuiteCreateSectionState } from '~/store/testSuite/create/section'

interface ToastArg {
  message: string
  duration?: number
  queue?: boolean
  pauseOnHover?: boolean
  position?:
    | 'top-right'
    | 'top'
    | 'top-left'
    | 'bottom-right'
    | 'bottom'
    | 'bottom-left'
  onDismiss?: () => void
  onClick?: () => void
  id?: string | number
  error?: boolean
  dismissible?: boolean
}

type ShowToast = (arg: ToastArg) => void

interface PToast {
  open: ShowToast
  clear: () => void
  default: ShowToast
  error: ShowToast
  info: ShowToast
  success: ShowToast
  warning: ShowToast
}

type CreateTestFormMap = Record<
  `question-${number}`,
  TestSuiteCreateSectionState['items'][0]
>

type GetAlertDialog = AppState['alertDialog']

export interface OpenAlertArgs {
  id: string
  title: string
  subtitle: string
  actions: GetAlertDialog['actions']
}

interface AlertDialog extends GetAlertDialog {
  open: (arg: OpenAlertArgs) => Promise<void>
  close: () => void
}

export interface CreateTestForm extends CreateTestFormMap {
  questionsLength: number
  questions: CreateTestFormQuestion[]
  warn: boolean
}

declare module 'vue/types/vue' {
  interface Vue {
    $breakpoint: BreakpointOutput
    $pToast: PToast
    $fullscreenLoading: FullscreenLoading
    $user: User
    $cookies: NuxtCookies
    $alert: AlertDialog
  }
}

declare module '@nuxt/types' {
  interface Context {
    $fullscreenLoading: FullscreenLoading
    $user: User
    $pToast: PToast
    $cookies: NuxtCookies
    $alert: AlertDialog
  }
}

declare global {
  interface Window {
    $user: User
  }
}
