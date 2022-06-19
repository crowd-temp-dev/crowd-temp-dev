// eslint-disable-next-line import/named
import Joi from 'joi'
import { RequestHandler, Router } from 'express'
import { authenticate } from '../../utils/middleware'
import { sendError, sendFormattedError, sendSuccess } from '../../utils/sendRes'
import DB from '../../../database'
import { User } from '../../../database/models/User/User'
import { TestDetail } from '../../../database/models/CreateTests/TestDetail'
import { SimpleSurvey } from '../../../database/models/CreateTests/SimpleSurvey'
import { FollowUpQuestion } from '../../../database/models/CreateTests/FollowUpQuestions'
import { WelcomeScreen } from '../../../database/models/CreateTests/WelcomeScreen'
import { ThankYouScreen } from '../../../database/models/CreateTests/ThankYouScreen'
import { uuidv4 } from '../../utils/validation'
import { getFullTest } from '../../../database/models/CreateTests/utils'
import { formSchema } from './utils'
import { CreateTestForm } from '~/types/form'

export interface CreateTestRes {
  welcomeScreen: WelcomeScreen
  thankYouScreen: ThankYouScreen
  info: TestDetail
}

type QuestionIndex = `${number}`

const formValidation: RequestHandler = (req, res, next) => {
  const sendErrorRes = (message: string) =>
    sendError(res, {
      message: {
        type: 'error',
        content: message,
      },
      status: 400,
    })

  const compileSchema = {
    id: uuidv4.required(),
    TestDetails: formSchema.TestDetails,
    WelcomeScreen: formSchema.WelcomeScreen,
    ThankYouScreen: formSchema.ThankYouScreen,
  } as unknown as Record<
    keyof typeof formSchema,
    typeof formSchema[keyof typeof formSchema]
  >

  const questionIndexes = []

  let repeatedQuestionIndex = false

  for (const _key in req.body) {
    const key = _key as keyof typeof formSchema

    if (!/^(?:id|TestDetails|WelcomeScreen|ThankYouScreen)$/.test(key)) {
      const compileQuestions = {} as Record<`${number}`, any>

      // loop through current loop and
      // push each indexed item to compileQuestions using the validation matching this current loop;
      for (const questionIndex in req.body[key]) {
        compileQuestions[questionIndex as `${number}`] = formSchema[key]

        repeatedQuestionIndex = questionIndexes.includes(questionIndex)

        questionIndexes.push(questionIndex)
      }

      compileSchema[key] = compileQuestions
    }

    if (repeatedQuestionIndex) {
      return sendErrorRes('Question indexes cannot be repeated!')
    }
  }

  const validate = Joi.object(compileSchema).validate(req.body)

  if (validate.error) {
    return sendErrorRes(validate.error.message || 'Invalid value(s)')
  }

  next()
}

// signed in users can add entry.
export default function (router: Router) {
  return router.post(
    '/createTest/create',
    formValidation,
    authenticate,
    async (req, res) => {
      const { userId } = req.signedCookies

      try {
        if (!userId) {
          throw new Error('{401} You must be logged in!')
        }

        await DB.transaction(async (transaction) => {
          const user = await User.findByPk(userId, {
            transaction,
          })

          if (!user) {
            throw new Error('{401} User not found!')
          }

          const {
            TestDetails: { name, description },
            WelcomeScreen: welcomeScreenForm,
            ThankYouScreen: thankYouScreenForm,
            // CardSorting: cardSorting,
            // CustomMessage: customMessage,
            // DesignSurvey: designS urveyd,
            // FiveSecondsTest: fiveSecondsTest,
            // PreferenceTest: preferenceTest,
            // PrototypeEvaluation: prototypeEvaluation,
            SimpleSurvey: simpleSurvey,
            // WebsiteEvaluation: websiteEvaluation,
          } = req.body as CreateTestForm

          // delete old test and create a new one
          await TestDetail.destroy({
            where: { id: req.body.id },
            transaction,
          })

          // create test
          const createTest = await TestDetail.create(
            {
              id: req.body.id,
              createdBy: user.id,
              name,
              description,
              progress: 'Draft: Recruit',
            },
            { transaction }
          )

          if (createTest.id) {
            // add welcome screen
            await WelcomeScreen.create(
              {
                ...welcomeScreenForm,
                testId: createTest.id,
              },
              { transaction }
            )

            // add thank you
            await ThankYouScreen.create(
              {
                ...thankYouScreenForm,
                testId: createTest.id,
              },
              { transaction }
            )

            // create simple surveys
            if (simpleSurvey) {
              let key: QuestionIndex
              let newSimpleSurvey: SimpleSurvey

              for (key in simpleSurvey) {
                newSimpleSurvey = await SimpleSurvey.create(
                  {
                    createdBy: user.id,
                    index: Number(key),
                    testId: createTest.id,
                  },
                  { transaction }
                )

                // create followup questions
                await FollowUpQuestion.bulkCreate(
                  simpleSurvey[key].followUpQuestions.map((question) => ({
                    id: question.id,
                    SimpleSurveyId: newSimpleSurvey.id,
                    choices: question.choices,
                    conditionalLogic: question.conditionalLogic,
                    conditionals: question.conditionals,
                    linearScale: question.linearScale,
                    required: question.required,
                    title: question.question,
                    type: question.type,
                  })),
                  { transaction }
                )
              }
            }

            const xx = await getFullTest(req.body.id, transaction)

            sendSuccess(res, {
              data: [createTest.get(), xx.data],
              message: {
                content: 'Test created!',
                type: 'success',
              },
            })
          } else {
            throw new Error('Error creating test at this time.')
          }
        })
      } catch (err: any) {
        sendFormattedError(err, res)
      }
    }
  )
}
