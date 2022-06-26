import { Model, ModelStatic, Transaction } from 'sequelize'
import { getAlphabets, removeUndefinedValues, sortObject } from '../../../utils'
import { FollowUpQuestion } from './FollowUpQuestions'
import { SimpleSurvey } from './SimpleSurvey'
import { CardSorting } from './CardSorting'
import { CustomMessage } from './CustomMessage'
import { FiveSecondsTest } from './FiveSecondsTest'
import { PreferenceTest } from './PreferenceTest'
import { PrototypeEvaluation } from './PrototypeEvaluation'
import { WebsiteEvaluation } from './WebsiteEvaluation'
import { DesignSurvey } from './DesignSurvey'
import { TestDetail } from './TestDetail'
import { ThankYouScreen } from './ThankYouScreen'
import { WelcomeScreen } from './WelcomeScreen'
import { CreateTestForm } from '~/store/create-test'
import { CreateTestTypes } from '~/types'
import { CreateTestFormQuestion } from '~/types/form'

type TestModel =
  | null
  | SimpleSurvey
  | DesignSurvey
  | CardSorting
  | CustomMessage
  | FiveSecondsTest
  | PreferenceTest
  | PrototypeEvaluation
  | WebsiteEvaluation

type QuestionKey = `question-${number}`

export async function getFullTest(
  id: string,
  transaction: Transaction,
  includeId: boolean = false
) {
  // get test, welcome screen and thank you screen
  const testDetails = await TestDetail.findByPk(id, {
    attributes: ['description', 'name', includeId ? 'id' : undefined].filter(
      Boolean
    ) as string[],
    transaction,
  })

  if (testDetails) {
    const welcomeScreen =
      (
        await WelcomeScreen.findOne({
          where: {
            testId: id,
          },
          attributes: ['buttonText', 'message', 'title'],
          transaction,
        })
      )?.get() || {}

    const thankYouScreen =
      (
        await ThankYouScreen.findOne({
          where: {
            testId: id,
          },
          attributes: ['message', 'title'],
          transaction,
        })
      )?.get() || {}

    const getFollowUpQuestions = async (
      model: TestModel,
      fKey: keyof FollowUpQuestion
    ) => {
      if (model) {
        const output = await FollowUpQuestion.findAll({
          where: {
            [fKey]: model.id,
          },
          attributes: [
            'choices',
            'conditionalLogic',
            'conditionals',
            'id',
            'linearScale',
            'type',
            'required',
            'title',
          ],
          transaction,
        })

        return output.map((val) => removeUndefinedValues(val.get(), true))
      }

      return []
    }

    const getSection = async (
      model: ModelStatic<Model>,
      type: CreateTestTypes,
      _attributes: (string | Record<string, string>)[] = []
    ) => {
      if (model) {
        const attributes = Array.from(
          new Set([
            'index',
            'id',
            ...Object.values(
              _attributes
                .map((x) => (typeof x === 'string' ? x : Object.keys(x)))
                .flat()
            ),
          ])
        )

        const section = await model.findAll({
          where: {
            testId: id,
          },
          attributes,
          transaction,
        })

        if (section.length) {
          const output = {} as Record<QuestionKey, any>

          for (const value of section) {
            //  @ts-ignore
            const questionKey = `question-${value.index + 1}` as QuestionKey

            output[questionKey] = {
              type,
              ...value.get(),
              followUpQuestions: await getFollowUpQuestions(
                value as any,
                `${type}Id` as keyof FollowUpQuestion
              ),
            }

            // add attributes
            const entries = Object.fromEntries(
              _attributes.map((value) => {
                if (typeof value === 'string') {
                  return [value, value]
                }

                return Object.entries(value).flat()
              })
            )

            for (const key in entries) {
              const value = entries[key]

              output[questionKey][value] = output[questionKey][key]

              if (key !== value) {
                delete output[questionKey][key]
              }
            }

            delete output[questionKey].index
          }

          return output
        }
      }

      return {}
    }

    const simpleSurvey = await getSection(SimpleSurvey, 'SimpleSurvey')

    const designSurvey = await getSection(DesignSurvey, 'DesignSurvey', [
      'fileType',
      'frameType',
      {
        fileURL: 'file',
      },
    ])

    const fiveSecondsTest = await getSection(
      FiveSecondsTest,
      'FiveSecondsTest',
      [
        'duration',
        {
          fileURL: 'file',
        },
      ]
    )

    const preferenceTest = await getSection(PreferenceTest, 'PreferenceTest', [
      { fileURLs: 'files' },
    ])

    const cardSorting = await getSection(CardSorting, 'CardSorting', [
      'cards',
      'categories',
      'task',
    ])

    const websiteEvaluation = await getSection(
      WebsiteEvaluation,
      'WebsiteEvaluation',
      ['websiteLink', 'task']
    )

    const prototypeEvaluation = await getSection(
      PrototypeEvaluation,
      'PrototypeEvaluation',
      ['websiteLink', 'task']
    )

    const customMessage = await getSection(CustomMessage, 'CustomMessage', [
      'message',
    ])

    const data = sortObject({
      testDetails: testDetails.get(),
      welcomeScreen,
      thankYouScreen,
      ...simpleSurvey,
      ...designSurvey,
      ...cardSorting,
      ...customMessage,
      ...fiveSecondsTest,
      ...preferenceTest,
      ...prototypeEvaluation,
      ...websiteEvaluation,
      empty: false,
    }) as unknown as CreateTestForm

    const indexes: (
      | `confirm-${number}${string}`
      | `${number}${string}-instruction`
      | `${number}${string}`
      | 'done'
    )[] = ['0a']

    let key: keyof typeof data

    for (key in data) {
      if (/^question-\d+$/.test(key)) {
        const qIndex = (key.match(/\d+$/g) || [])[0]

        if (qIndex) {
          const qIndexLetters =
            (data[key] as CreateTestFormQuestion).followUpQuestions?.map(
              (_, i) => `${qIndex}${getAlphabets(i)}` as `${number}${string}`
            ) || []

          indexes.push(`confirm-${qIndexLetters[0]}`)

          if (
            /FiveSecondsTest|CardSorting/.test(
              (data[key] as CreateTestFormQuestion).type
            )
          ) {
            indexes.push(`${qIndexLetters[0]}-instruction`)
          }

          indexes.push(...qIndexLetters)
        }
      }
    }

    indexes.push('done')

    return {
      data,
      indexes,
    }
  }

  return {
    error: true,
  }
}
