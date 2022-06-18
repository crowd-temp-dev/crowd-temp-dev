import { Transaction } from 'sequelize'
import { getAlphabets, removeUndefinedValues } from '../../../utils'
import { FollowUpQuestion } from './FollowUpQuestions'
import { SimpleSurvey } from './SimpleSurvey'
import { TestDetail } from './TestDetail'
import { ThankYouScreen } from './ThankYouScreen'
import { WelcomeScreen } from './WelcomeScreen'
import { CreateTestForm } from '~/store/create-test'
import { CreateTestComponent } from '~/types'
import { CreateTestFormQuestion } from '~/types/form'

type TestModel = null | SimpleSurvey

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
      (await WelcomeScreen.findOne({
        where: {
          testId: id,
        },
        attributes: ['buttonText', 'message', 'title'],
        transaction,
      })) || {}

    const thankYouScreen =
      (await ThankYouScreen.findOne({
        where: {
          testId: id,
        },
        attributes: ['message', 'title'],
        transaction,
      })) || {}

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

    const simpleSurvey = async () => {
      // get simple survey
      const getSimpleSurvey = await SimpleSurvey.findAll({
        where: {
          testId: id,
        },
        attributes: ['index', 'id'],
        transaction,
      })

      if (getSimpleSurvey.length) {
        const output = {} as Record<QuestionKey, any>

        for (const value of getSimpleSurvey) {
          const questionKey = `question-${value.index + 1}` as QuestionKey

          output[questionKey] = {
            type: 'SimpleSurvey' as CreateTestComponent,
            ...value.get(),
            followUpQuestions: await getFollowUpQuestions(
              value,
              'SimpleSurveyId'
            ),
          }

          delete output[questionKey].index
        }

        return output
      }

      return {}
    }

    const data = {
      testDetails: testDetails.get(),
      welcomeScreen,
      thankYouScreen,
      ...(await simpleSurvey()),
      empty: false,
    } as unknown as CreateTestForm

    const indexes: (
      | `confirm-${number}${string}`
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
