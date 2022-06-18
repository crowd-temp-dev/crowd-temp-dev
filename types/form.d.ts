import { CreateTestComponent, FiveSecondsTestDurations } from '.'
import { QuestionModelValue } from '~/components/App/CreateTest/Steps/FollowUpQuestion/Question/type'
import { DesignSurveyFileType, DesignSurveyFrameType } from '~/database/type'

type Question<T> = Record<`${number}`, T>

export interface CreateTestForm {
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
    task: string
    cards: string[]
    categories: string[]
    followUpQuestions: QuestionModelValue[]
  }>

  DesignSurvey: Question<{
    fileType: DesignSurveyFileType
    frameType: DesignSurveyFrameType
    file: [File]
    followUpQuestions: QuestionModelValue[]
  }>

  FiveSecondsTest: Question<{
    duration: FiveSecondsTestDurations | `${FiveSecondsTestDurations}`
    file: [File]
    followUpQuestions: QuestionModelValue[]
  }>

  WebsiteEvaluation: Question<{
    websiteLink: string
    task?: string
    followUpQuestions: QuestionModelValue[]
  }>

  PrototypeEvaluation: Question<{
    websiteLink: string
    task?: string
    followUpQuestions: QuestionModelValue[]
  }>

  PreferenceTest: Question<{
    files: [File] | [File, File] | [File, File, File] | [File, File, File, File]
    followUpQuestions: QuestionModelValue[]
  }>

  CustomMessage: Question<{
    message: string
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

  // for custom message
  message?: string

  // for preference test
  files?: File[][]
}