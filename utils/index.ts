import { v4 } from 'uuid'
import { nextTick } from '@vue/composition-api'
import {
  CancelEmailChange,
  ChangeEmail,
  ConfirmAccount,
  LogoutAllSessions,
} from '../services/auth'

import type {
  ApiAction,
  ApiResponse,
  CreateTestComponent,
  Feature,
  FeatureTitle,
  FiveSecondsTestDurations,
  HTMLAttrs,
  VueElement,
} from '~/types'
import { CreateTestFormQuestion } from '~/types/form'

export const htmlAttrs: HTMLAttrs = {
  lang: 'en-us',
  class: 'bg-surface-default text-text-default text-body-sm md:text-body',
}

export const features: Feature = {
  'Simple survey': {
    color: '#D2A0E3',
    subtitle:
      'Ask participants the questions that matter to you without worry.',
    createTestComponent: 'SimpleSurvey',
  },
  'Card sorting': {
    color: '#7DACF2',
    subtitle:
      'Card sorting helps you plan and evaluate the information architecture of your website.',
    createTestComponent: 'CardSorting',
  },
  'Design Survey': {
    color: '#91E0D6',
    subtitle:
      'Ask the questions that matter to you with option to see a media file while answering.',
    createTestComponent: 'DesignSurvey',
  },
  'Five second test': {
    color: '#FFC96B',
    subtitle:
      'Participants are shown an image for a short time before answering questions.',
    createTestComponent: 'FiveSecondsTest',
  },
  'Website evaluation': {
    color: '#D2A0E3',
    subtitle:
      'Have a live site? Get useful feedback on ease of use, opportunities for improvements etc.',
    createTestComponent: 'WebsiteEvaluation',
  },
  'Prototype evaluation': {
    color: '#FFC4B0',
    subtitle:
      'Test your product before writing a single line of code using prototypes.',
    createTestComponent: 'PrototypeEvaluation',
  },
  'Preference test': {
    color: '#FDC9D0',
    subtitle: 'Quickly validate different versions of your idea with users. ',
    createTestComponent: 'PreferenceTest',
  },
  'Custom message': {
    color: '#C3C8C7',
    subtitle:
      'Want to add special instructions before a test type? Add it here.',
    createTestComponent: 'CustomMessage',
  },
}

export const sleep = (duration: number = 0) =>
  new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve(duration)
      clearTimeout(timeout)
    }, duration)
  })

export const focusInput = (evt: AnimationEvent) => {
  if (evt.animationName === 'fadeAppear') {
    const root = evt.currentTarget as HTMLElement

    if (root) {
      nextTick(() => {
        const input = root.querySelector('input')

        if (input) {
          input.focus()
        }
      })
    }
  }
}

let uidCount = 0
/**
 * Uid: Function to get unique id
 * **/
export const uid = (prefix?: string) => {
  uidCount += 1

  const toString = (val: number) => val.toString(36)

  const getPrefix = prefix === '' ? '' : prefix || 'uid-'

  const runningTime = toString(performance.now())

  const date = process.client ? '' : `-${toString(Date.now())}`

  const elapsedCalls = toString(uidCount)

  return `${getPrefix}${runningTime}${date}-${elapsedCalls}`.replace(/\./g, '-')
}

export const uuidv4 = v4

export const getDialogAttrs = (
  expanded: boolean,
  id = uid(),
  modal: boolean = true
) => {
  const describedby = `describe-${id}`
  const triggerId = `trigger-${id}`

  return {
    trigger: {
      id: triggerId,
      'aria-controls': id,
      'aria-haspopup': 'dialog',
      'aria-expanded': expanded,
    },
    dialog: {
      id,
      role: 'dialog',
      'aria-modal': modal ? 'true' : undefined,
      'aria-describedby': expanded ? describedby : undefined,
      'aria-labelledby': triggerId,
    },
    describedby: {
      id: describedby,
    },
  }
}

export const splitPath = (path: string) => path.split('/').filter(Boolean)

export const suffixSlash = (str?: string) =>
  !str ? '' : `${str}/`.replace(/\/{2,}$/, '/')

/**
 * @name pseudoFocus
 * @description
 * pseudo focus for comboboxes, dropdowns, menus or any element that requires its activator to be focused, and still show a focus state on its children
 * @param { HTMLElement } el
 **/
export const pseudoFocus = (el: HTMLElement) => {
  if (el && el.classList.contains('pseudo-focus') && !el.dataset.disabled) {
    const combobox = el.closest('.combobox')

    if (combobox) {
      const pseudoFocusChildren = combobox.querySelectorAll('.pseudo-focus')

      if (pseudoFocusChildren.length) {
        for (const node of Array.from(
          pseudoFocusChildren as NodeListOf<HTMLElement>
        )) {
          delete node.dataset.pseudoFocus
        }

        el.dataset.pseudoFocus = 'true'

        // @ts-ignore
        el.scrollIntoViewIfNeeded()
      }
    }
  }
}

export const pseudoFocusOnMouseEnter = (evt: MouseEvent) => {
  const currentTarget = evt.currentTarget as HTMLElement

  pseudoFocus(currentTarget)
}

export const layoutSizing = {
  appHeader: 56,
  layoutHeader: 76,
  layoutPadding: 32,
  get allSizes() {
    return this.appHeader + this.layoutHeader + this.layoutPadding
  },
}

export const oneFrame = 1000 / 60

/**
 * @name stepper
 * @description
 * Interporlates from, to, and ratio values to form a progress moving from the 'from' value to the 'to' value in respect to the ratio.
 * @param { number } from - Value to interpolate from
 * @param { number } to - Value to interpolate to
 * @param { number } ratio - Progress of interpolation. This should ultimately be a value between 0 and 1
 * @returns `number` Between 0 and 1
 * **/
export const stepper = (from: number, to: number, ratio: number): number =>
  (from - to) * ratio + to

function easeOutCirc(x: number): number {
  return Math.sqrt(1 - Math.pow(x - 1, 2))
}

export function scrollMain(scrollTo: number, mainEl?: HTMLElement) {
  if (process.client) {
    const frames = [
      ...Array.from({ length: oneFrame }, (_, i) => i / oneFrame),
      1,
    ]

    const main = mainEl || document.querySelector('main')

    if (main) {
      const scrollFrom = main.scrollTop

      const scroll = (index: number) => {
        const frame = frames[index]

        if (typeof frame === 'number') {
          requestAnimationFrame(() => {
            main.scrollTo(0, stepper(scrollTo, scrollFrom, easeOutCirc(frame)))

            scroll(index + 1)
          })
        }
      }

      scroll(0)
    }
  }
}

export const oneMinute = 60_000

export const oneHour = oneMinute * 60

export const oneDay = oneHour * 24

export const inOneHour = () => Date.now() * oneHour

export const inOneDay = () => Date.now() * oneDay

export function formatTime(time: number) {
  if (time <= 5000 || !time) {
    return 'Just now'
  }

  if (time < oneMinute) {
    return 'Few seconds ago'
  }

  const timeInMin = Math.floor(time / oneMinute)

  const formatValue = (value: number, verb: 'A' | 'An') =>
    value === 1 ? verb : value

  const pluralize = (value: number) => (value > 1 ? 's' : '')

  if (timeInMin <= 59) {
    return `${formatValue(timeInMin, 'A')} min${pluralize(timeInMin)} ago`
  }

  const timeInHr = Math.floor(timeInMin / 60)

  if (timeInHr <= 23) {
    return `${formatValue(timeInHr, 'An')} hour${pluralize(timeInHr)} ago`
  }

  const timeInDay = Math.floor(timeInHr / 24)

  if (timeInDay <= 30) {
    return `${formatValue(timeInDay, 'A')} day${pluralize(timeInDay)} ago`
  }

  const timeInMonth = Math.floor(timeInDay / 31)

  if (timeInMonth <= 11) {
    return `${formatValue(timeInMonth, 'A')} month${pluralize(timeInMonth)} ago`
  }

  const timeInYear = Math.floor(timeInMonth / 12)

  return `${formatValue(timeInYear, 'A')} year${pluralize(timeInYear)} ago`
}

export const removeUndefinedValues = (
  arg: Record<string, any>,
  removeNull: boolean = false
): Record<string, any> => {
  const output = { ...arg }

  for (const key in output) {
    if (
      typeof output[key] === 'undefined' ||
      (removeNull ? output[key] === null : false)
    ) {
      delete output[key]
    }
  }

  return output
}

export const passwordRegExpString =
  '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?#)(-_^~&]{2,32}$'

export const emailRegExpString =
  '^\\w+([.-]?\\w+)*@\\w+([.-]?\\w+)*(\\.\\w{1,})?$'

export const creatTestProgressRegExpString =
  '^(?:Draft: Create|Draft: Recruit|Completed)$'

export const roleRegExpString = '^(?:user|tester)$'

export const urlRegExpString =
  '^((http(s?)?):\\/\\/)?([wW]{3}\\.)?[a-zA-Z0-9\\-.]+\\.[a-zA-Z]{2,}(\\.[a-zA-Z]{2,})?/?$'

export const addTransitioningDataAttr = () => {
  if (process.client) {
    document.documentElement.dataset.pageTransitioning = ''
  }
}

export const removeTransitioningDataAttr = () => {
  if (process.client) {
    requestAnimationFrame(() => {
      delete document.documentElement.dataset.pageTransitioning
    })
  }
}

/**
 * @name getObjectPathValue
 * @description
 * Gets path of a non circular object using strings
 * @param {string} path String path E.g `pathA.pathB.pathC`
 * @param {Record<string, any>} object The object to search on
 * @param {number} [index] Used to start the search from a specific path's index. Mostly used internally.
 * @returns `any` Found value
 * **/
export const getObjectPathValue = (
  path: string,
  object: Record<string, any> = {},
  index: number = 0
): any => {
  if (!path) {
    return object
  }

  const splitPath = path.split('.').filter(Boolean)

  // path has been found
  if (splitPath.length === 1) {
    return object[splitPath[0]]
  }

  return getObjectPathValue(
    [...splitPath].splice((index || 0) + 1).join('.'),
    object[splitPath[0]]
  )
}

export const freshQuestion = () =>
  ({
    id: uuidv4(),
    conditionalLogic: false,
    question: '',
    required: false,
    type: 'short-text',
  } as unknown as CreateTestFormQuestion)

export const getTestFeatureTitle = (
  value: CreateTestComponent
): FeatureTitle | 'Invalid test' => {
  switch (value) {
    case 'SimpleSurvey':
      return 'Simple survey'
    case 'CardSorting':
      return 'Card sorting'
    case 'DesignSurvey':
      return 'Design Survey'
    case 'FiveSecondsTest':
      return 'Five second test'
    case 'PrototypeEvaluation':
      return 'Prototype evaluation'
    case 'WebsiteEvaluation':
      return 'Website evaluation'
    case 'PreferenceTest':
      return 'Preference test'
    case 'CustomMessage':
      return 'Custom message'
    default:
      return 'Invalid test'
  }
}

const alphabets = Array.from(Array(26))
  .map((_, i) => i + 65)
  .map((x) => String.fromCharCode(x).toLowerCase())

export const getAlphabets = (index: number): string => {
  return alphabets[index]
}

export const getAlphabetIndex = (letter: string): number => {
  return alphabets.indexOf(letter)
}

export const fiveSecondsTestDurations: FiveSecondsTestDurations[] = [
  5000, 10000, 15000, 20000, 25000, 30000, 45000, 60000,
]

/**
 * @name newTestConstructor
 * @description
 * Returns a new test with dynamic properties according to the type of test to create
 * @param {CreateTestComponent} type
 * @returns {CreateTestFormQuestion}
 * **/
export const newTestConstructor = (
  type: CreateTestComponent
): CreateTestFormQuestion => {
  const addPaths = (
    condition: boolean,
    paths: Record<string, any>
  ): Record<string, any> => (condition ? paths : {})

  return {
    type,
    id: uuidv4(),
    followUpQuestions: type !== 'CustomMessage' ? [freshQuestion()] : undefined,

    ...addPaths(type === 'CardSorting', {
      categories: ['', ''],
      cards: ['', ''],
      task: '',
    }),

    ...addPaths(type === 'DesignSurvey', {
      fileType: 'image',
      frameType: 'no-frame',
      file: [],
    }),

    ...addPaths(type === 'FiveSecondsTest', {
      duration: String(Number(fiveSecondsTestDurations[0])),
      file: [],
    }),

    ...addPaths(type === 'WebsiteEvaluation', {
      task: '',
      websiteLink: '',
    }),

    ...addPaths(type === 'PrototypeEvaluation', {
      task: '',
      prototypeLink: '',
      prototypeProvider: 'figma',
    }),

    ...addPaths(type === 'CustomMessage', {
      message: '',
      title: '',
    }),

    ...addPaths(type === 'PreferenceTest', {
      files: [[], [], [], []],
    }),
  } as unknown as CreateTestFormQuestion
}

/***
 * @name convertToByte
 * @description
 * Returns size in byte for values in kb, mb, and gb
 * @param {string} formattedValue
 * @returns {number} Size in byte
 * */
export const convertToByte = (
  formattedValue: `${number}${'kb' | 'mb' | 'gb'}`
): number => {
  const size = (formattedValue.match(/(?:kb|mb|gb)\s?$/g) || [])[0] as
    | 'kb'
    | 'mb'
    | 'gb'

  let convertSize: number

  switch (size) {
    case 'kb':
      convertSize = 1_000
      break
    case 'mb':
      convertSize = 1_000_000
      break
    case 'gb':
      convertSize = 1_000_000_000
  }

  return parseFloat(formattedValue) * convertSize
}

/***
 * @name formatByte
 * @description
 * Returns formatted size in kb, mb, and gb
 * @param {number} bytes
 * @param {number} fixed
 * @returns {string} Formatted size
 * */
export const formatByte = (bytes: number, fixed: number = 2): string => {
  const kb = 1_000

  const mb = kb * kb

  const gb = mb * kb

  const convertSize =
    bytes < kb
      ? 1
      : bytes >= kb && bytes < mb
      ? kb
      : bytes >= mb && bytes < gb
      ? mb
      : gb

  let sizeType: 'byte' | 'kb' | 'mb' | 'gb'

  switch (convertSize) {
    case kb:
      sizeType = 'kb'
      break
    case mb:
      sizeType = 'mb'
      break
    case gb:
      sizeType = 'gb'
      break
    default:
      sizeType = 'byte'
  }

  return `${(bytes / convertSize).toFixed(fixed)}${sizeType}`
}

export const actionRoutes: Record<
  ApiAction,
  {
    request: (
      this: Vue,
      arg: { token: string; id?: string }
    ) => Promise<ApiResponse<any>>
    message: string
    redirect: string
  }
> = {
  end_all_sessions: {
    async request(arg) {
      const res = await LogoutAllSessions(this.$axios, {
        token: arg.token,
        id: arg.id as string,
      })

      if (!res.error) {
        sleep(oneFrame).then(() => {
          this.$user.logout()
        })
      }

      return res
    },
    message: 'Ending all sessions...',
    redirect: '/',
  },
  confirm_account: {
    async request(arg) {
      const res = await ConfirmAccount(this.$axios, {
        token: arg.token,
      })

      if (res.data) {
        await this.$user.reload()
      }

      return res
    },
    message: 'Confirming account...',
    redirect: '/',
  },
  cancel_email_change: {
    async request(arg) {
      return await CancelEmailChange(this.$axios, {
        token: arg.token,
        id: arg.id as string,
      })
    },
    message: 'Cancelling email change...',
    redirect: '/',
  },
  change_email: {
    async request(arg) {
      const res = await ChangeEmail(this.$axios, {
        token: arg.token,
        id: arg.id as string,
      })

      if (res.data) {
        await this.$user.reload()
      }

      return res
    },
    message: 'Changing email...',
    redirect: '/',
  },
}

export const confirmDeleteAccount = 'delete my account'

export const confirmDeleteAccountRegExp = `^${confirmDeleteAccount}$`

export const pingAddNewBlockBtn = async () => {
  if (process.client) {
    const addNewBlockRoot = document.getElementById(
      'add-new-block'
    ) as VueElement

    if (addNewBlockRoot) {
      addNewBlockRoot.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })

      if (typeof addNewBlockRoot.__vue__.togglePingBtn === 'function') {
        await sleep(600)

        addNewBlockRoot.__vue__.togglePingBtn?.()

        await sleep(1000)
      }

      addNewBlockRoot.querySelector('button')?.focus({ preventScroll: true })
    }
  }
}

export const answerTestLoadingId = 'answer-test-fullscreen-loading'

export const otherChoicePrefix = '***OTHER***'

export const scrollToLandingPageHash = (
  routeHash: string,
  smooth?: boolean
) => {
  const validHash = ['features', 'pricing', 'contact']

  const hashValue = routeHash.replace(/^#/, '').trim()

  if (validHash.includes(hashValue)) {
    const hashEl = document.getElementById(hashValue) as HTMLElement

    if (hashEl) {
      const header = document.getElementById(
        'landing-page-header'
      ) as HTMLElement

      const top = hashEl.offsetTop - (32 + (header ? header.clientHeight : 0))

      sleep(oneFrame).then(() => {
        window.scrollTo({
          top,
          behavior: smooth ? 'smooth' : 'auto',
        })
      })
    }
  }
}

export const formBody = (arg?: Record<string, any>) => {
  if (process.client) {
    const formEl = document.createElement('form')

    formEl.enctype = 'multipart/form-data'

    const formData = new FormData(formEl)

    if (typeof arg === 'object') {
      for (const key in arg) {
        if (/string|number/.test(typeof arg[key])) {
          formData.set(key, arg[key])
        }
      }
    }

    return formData
  }

  return null
}

/**
 * @name convertToMilliSeconds
 * @description
 * Converts seconds from '1000ms' to '1000' and from '1s' to 1000
 * @param {string|number} rawDuration - Formatted duration
 * @param {number} [fallback] - Fallback if rawDuration is invalid
 * @returns {number}
 * **/
export function convertToMilliSecond(
  rawDuration: string | number,
  fallback?: number
): number {
  const parsed = parseFloat(`${rawDuration}`)

  if (isNaN(parsed) || parsed === Infinity) {
    return fallback || 0
  }

  if (typeof rawDuration === 'number') {
    return rawDuration >= 0 ? rawDuration : 0
  }

  if (typeof rawDuration === 'string') {
    const isSeconds = /^\d+(?:\.\d+)?s$/.test(rawDuration)
    if (isSeconds) {
      const parsedOutput = parsed * 1000

      return parsedOutput >= 0 ? parsedOutput : 0
    }

    const isMilliSeconds = /^\d+(?:\.\d+)?(?:ms)?$/.test(rawDuration)
    if (isMilliSeconds) {
      return parsed >= 0 ? parsed : 0
    }
  }

  return 0
}

export const sortObject = (
  object: Record<string, any>,
  cb?: (firstKey: string, nextKey: string) => number
): Record<string, any> => {
  return Object.fromEntries(
    Object.entries(object).sort(([firstKey], [nextKey]) => {
      if (typeof cb === 'function') {
        return cb(firstKey, nextKey)
      }

      return firstKey > nextKey ? 1 : -1
    })
  )
}

export const generateShareLink = (link: string) =>
  process.client ? `${location.origin}/answer-test/${link}/` : ''
