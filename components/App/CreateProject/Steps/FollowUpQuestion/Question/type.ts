export type SelectValue =
  | 'short-text'
  | 'long-text'
  | 'multi-choice'
  | 'checkbox'
  | 'linear-scale'

export interface SelectOption {
  label:
    | 'Short text'
    | 'Long text'
    | 'Multiple choice'
    | 'Checkbox'
    | 'Linear scale'
  value: SelectValue
  disabled?: boolean
}

export interface QuestionModelValue {
  id: string
  title: string
  conditionalLogic: boolean
  required: boolean
  type: SelectValue
  
  conditionals: {
    action: 'goto' | 'show'
    question: string
    questionAnswer: string
  }
  choices: {
    options: string[]
    maxSelection?: string
    addOtherAsChoice?: boolean
  }
  linearScale: {
    type: 'number' | 'star'
    start: {
      value: `${number}`
      label: string
    }
    end: {
      value: `${number}`
      label: string
    }
  }
}
