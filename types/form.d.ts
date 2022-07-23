import { FiveSecondTestDurations } from '.'
import { QuestionModelValue } from '~/components/App/CreateProject/Steps/FollowUpQuestion/Question/type'
import { DesignSurveyFileType, DesignSurveyFrameType } from '~/database/type'
import { TestSuiteCreateSectionItem } from '~/store/projectSuite/create/section'

type Question<T> = Record<`${number}`, T>

export interface ProjectForm {
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

export type ProjectFormQuestion = TestSuiteCreateSectionItem
