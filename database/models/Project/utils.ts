import { Model, ModelStatic, Transaction } from 'sequelize'
import { getAlphabets, removeUndefinedValues, sortObject } from '../../../utils'
import { FollowUpQuestion } from './FollowUpQuestions'
import { SimpleSurvey } from './SimpleSurvey'
import { CardSorting } from './CardSorting'
import { CustomMessage } from './CustomMessage'
import { FiveSecondTest } from './FiveSecondTest'
import { PreferenceTest } from './PreferenceTest'
import { PrototypeEvaluation } from './PrototypeEvaluation'
import { WebsiteEvaluation } from './WebsiteEvaluation'
import { DesignSurvey } from './DesignSurvey'
import { TestDetail } from './TestDetail'
import { ThankYouScreen } from './ThankYouScreen'
import { WelcomeScreen } from './WelcomeScreen'
import { ProjectTypes } from '~/types'
import { ProjectFormQuestion } from '~/types/form'
import { ProjectForm } from '~/store/projectSuite'

type TestModel =
  | null
  | SimpleSurvey
  | DesignSurvey
  | CardSorting
  | CustomMessage
  | FiveSecondTest
  | PreferenceTest
  | PrototypeEvaluation
  | WebsiteEvaluation

type QuestionKey = `question-${number}`

export async function getFullTest(
  id: string,
  transaction: Transaction,
  includeId: boolean = false,
  matchUserId?: string,
  testDetailsAttrs?: string[]
) {
  // get test, welcome screen and thank you screen
  const testDetails = await TestDetail.findByPk(id, {
    attributes: [
      'description',
      'name',
      includeId ? 'id' : undefined,
      matchUserId ? 'createdBy' : undefined,
      ...(testDetailsAttrs || []),
    ].filter(Boolean) as string[],
    transaction,
  })

  if (matchUserId && testDetails.createdBy !== matchUserId) {
    throw new Error('{403} You cannot access this test!')
  }

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
      type: ProjectTypes,
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

        const isCustomMessage = /^(?:CustomMessage)$/.test(
          Object.getOwnPropertyDescriptor(
            model as unknown as CustomMessage,
            'name'
          ).value
        )

        if (section.length) {
          const output = {} as Record<QuestionKey, any>

          for (const value of section) {
            //  @ts-ignore
            const questionKey = `question-${value.index + 1}` as QuestionKey

            const followUpQuestions = isCustomMessage
              ? {}
              : {
                  followUpQuestions: await getFollowUpQuestions(
                    value as any,
                    `${type}Id` as keyof FollowUpQuestion
                  ),
                }

            output[questionKey] = {
              type,
              ...value.get(),
              ...followUpQuestions,
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

    const fiveSecondTest = await getSection(
      FiveSecondTest,
      'FiveSecondTest',
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
      ['prototypeLink', 'prototypeProvider', 'task']
    )

    const customMessage = await getSection(CustomMessage, 'CustomMessage', [
      'message',
      'title',
    ])

    const getTestDetails = testDetails.get()

    delete getTestDetails.createdBy

    const data = sortObject({
      testDetails: getTestDetails,
      welcomeScreen,
      thankYouScreen,
      ...simpleSurvey,
      ...designSurvey,
      ...cardSorting,
      ...customMessage,
      ...fiveSecondTest,
      ...preferenceTest,
      ...prototypeEvaluation,
      ...websiteEvaluation,
    }) as unknown as ProjectForm

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
          if (typeof (data[key] as Record<string, any>).file === 'string') {
            const file = (data[key] as Record<string, any>).file

            ;(data[key] as Record<string, any>).file = [file]
          }

          const qIndexLetters =
            (data[key] as ProjectFormQuestion).followUpQuestions?.map(
              (_, i) => `${qIndex}${getAlphabets(i)}` as `${number}${string}`
            ) || []

          const questionType = (data[key] as ProjectFormQuestion).type

          const fallbackQNumber = `${Number(qIndex)}a` as `${number}${string}`

          if (questionType === 'CustomMessage') {
            indexes.push(fallbackQNumber)
          } else {
            indexes.push(`confirm-${qIndexLetters[0] || fallbackQNumber}`)
          }

          if (/FiveSecondTest|CardSorting/.test(questionType)) {
            indexes.push(`${qIndexLetters[0] || fallbackQNumber}-instruction`)
          }

          qIndexLetters.length && indexes.push(...qIndexLetters)
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
    message: '',
  }
}
