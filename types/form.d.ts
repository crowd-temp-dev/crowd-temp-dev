import { CreateTestComponent, FiveSecondTestDurations } from '.'
import { QuestionModelValue } from '~/components/App/CreateTest/Steps/FollowUpQuestion/Question/type'
import { DesignSurveyFileType, DesignSurveyFrameType } from '~/database/type'

type Question<T> = Record<`${number}`, T>

export interface CreateTestForm {
  id?: string

  TestDetails: {
    name: string
    description: string
  }

  WelcomeScreen: {
    title: string
    message: string
    buttonText: string
  }

  ThankYouScreen: {
    title: string
    message: string
  }

  SimpleSurvey: Question<{
    id: string
    followUpQuestions: QuestionModelValue[]
  }>

  CardSorting: Question<{
    id: string
    task: string
    cards: string[]
    categories: string[]
    followUpQuestions: QuestionModelValue[]
  }>

  DesignSurvey: Question<{
    id: string
    fileType: DesignSurveyFileType
    frameType: DesignSurveyFrameType
    file: [File]
    followUpQuestions: QuestionModelValue[]
  }>

  FiveSecondTest: Question<{
    id: string
    duration: FiveSecondTestDurations | `${FiveSecondTestDurations}`
    file: [File]
    followUpQuestions: QuestionModelValue[]
  }>

  WebsiteEvaluation: Question<{
    id: string
    websiteLink: string
    task?: string
    followUpQuestions: QuestionModelValue[]
  }>

  PrototypeEvaluation: Question<{
    id: string
    prototypeLink: string
    prototypeProvider: 'figma'
    task?: string
    followUpQuestions: QuestionModelValue[]
  }>

  PreferenceTest: Question<{
    id: string
    files: number
    followUpQuestions: QuestionModelValue[]
  }>

  CustomMessage: Question<{
    id: string
    message: string
    title: string
  }>
}

export interface CreateTestFormQuestion {
  type: CreateTestComponent
  id: string
  followUpQuestions?: QuestionModelValue[]

  task?: string
  file?: File[]

  // for cards
  cards?: string[]
  categories?: string[]

  // for design survey
  fileType?: DesignSurveyFileType
  frameType?: DesignSurveyFrameType

  // for 5ST
  duration?: `${number}`

  // for website evaluation
  websiteLink: string

  // for prototype evaluation
  prototypeLink: string
  prototypeProvider: string

  // for custom message
  title?: string
  message?: string

  // for preference test
  files?: File[][]
}
