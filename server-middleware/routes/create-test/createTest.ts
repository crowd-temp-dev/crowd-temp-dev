// eslint-disable-next-line import/named
import Joi from 'joi'
import { RequestHandler, Router } from 'express'
import { authenticate } from '../../utils/middleware'
import { sendError, sendFormattedError, sendSuccess } from '../../utils/sendRes'
import DB from '../../../database'
import { User } from '../../../database/models/User/User'
import { TestDetail } from '../../../database/models/CreateTests/TestDetail'
import { SimpleSurvey } from '../../../database/models/CreateTests/SimpleSurvey'
import { CardSorting } from '../../../database/models/CreateTests/CardSorting'
import { WebsiteEvaluation } from '../../../database/models/CreateTests/WebsiteEvaluation'
import { PrototypeEvaluation } from '../../../database/models/CreateTests/PrototypeEvaluation'
import { PreferenceTest } from '../../../database/models/CreateTests/PreferenceTest'
import { CustomMessage } from '../../../database/models/CreateTests/CustomMessage'
import { FiveSecondsTest } from '../../../database/models/CreateTests/FiveSecondsTest'
import { DesignSurvey } from '../../../database/models/CreateTests/DesignSurvey'
import { FollowUpQuestion } from '../../../database/models/CreateTests/FollowUpQuestions'
import { WelcomeScreen } from '../../../database/models/CreateTests/WelcomeScreen'
import { ThankYouScreen } from '../../../database/models/CreateTests/ThankYouScreen'
import { uuidv4 } from '../../utils/validation'
import { uuidv4 as getUuid } from '../../../utils'
import { uploadFile } from '../fileManager/utils'
import { formSchema } from './utils'
import { CreateTestForm } from '~/types/form'
import { QuestionModelValue } from '~/components/App/CreateTest/Steps/FollowUpQuestion/Question/type'

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

  const formFields = JSON.parse(req.body.fields)

  for (const _key in formFields) {
    const key = _key as keyof typeof formSchema

    if (!/^(?:id|TestDetails|WelcomeScreen|ThankYouScreen)$/.test(key)) {
      const compileQuestions = {} as Record<`${number}`, any>

      // loop through current loop and
      // push each indexed item to compileQuestions using the validation matching this current loop;
      for (const questionIndex in formFields[key]) {
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

  const validate = Joi.object(compileSchema).validate(formFields)

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

        const transaction = await DB.transaction()

        const user = await User.findByPk(userId, {
          transaction,
        })

        if (!user) {
          await transaction.rollback()

          throw new Error('{401} User not found!')
        }

        const formFields = JSON.parse(
          req.body.fields as string
        ) as CreateTestForm

        if (!formFields.id) {
          await transaction.rollback()

          throw new Error('{400} No Fields')
        }

        const {
          TestDetails: { name, description },
          WelcomeScreen: welcomeScreenForm,
          ThankYouScreen: thankYouScreenForm,
          CardSorting: cardSorting,
          CustomMessage: customMessage,
          DesignSurvey: designSurvey,
          FiveSecondsTest: fiveSecondsTest,
          PreferenceTest: preferenceTest,
          PrototypeEvaluation: prototypeEvaluation,
          SimpleSurvey: simpleSurvey,
          WebsiteEvaluation: websiteEvaluation,
        } = formFields

        // delete old test and create a new one
        await TestDetail.destroy({
          where: { id: formFields.id },
          transaction,
        })

        // create test
        const createTest = await TestDetail.create(
          {
            id: formFields.id,
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

          const saveFollowUpQuestions = async (
            followUpQuestions: QuestionModelValue[],
            modelId: Record<string, string>
          ) => {
            // create followup questions
            await FollowUpQuestion.bulkCreate(
              followUpQuestions.map((question) => ({
                id: question.id,
                choices: question.choices,
                conditionalLogic: question.conditionalLogic,
                conditionals: question.conditionals,
                linearScale: question.linearScale,
                required: question.required,
                title: question.title,
                type: question.type,
                ...modelId,
              })),
              { transaction }
            )
          }

          // const getFileUrl = (
          //   type: CreateTestTypes,
          //   id: string,
          //   fileName: string
          // ) => {
          //   return `/user/${userId}/tests/${type}/${id}/${fileName}`
          // }

          const getFileNames = (length = 1) => {
            return Array.from({ length }, () => getUuid())
          }

          if (simpleSurvey) {
            let key: QuestionIndex
            let newSimpleSurvey: SimpleSurvey

            for (key in simpleSurvey) {
              const section = simpleSurvey[key]

              newSimpleSurvey = await SimpleSurvey.create(
                {
                  createdBy: user.id,
                  index: Number(key),
                  testId: createTest.id,
                  id: section.id,
                },
                { transaction }
              )

              await saveFollowUpQuestions(section.followUpQuestions, {
                SimpleSurveyId: newSimpleSurvey.id,
              })
            }
          }

          if (cardSorting) {
            let key: QuestionIndex
            let newCardSorting: CardSorting

            for (key in cardSorting) {
              const section = cardSorting[key]

              newCardSorting = await CardSorting.create(
                {
                  createdBy: user.id,
                  index: Number(key),
                  testId: createTest.id,
                  cards: section.cards,
                  categories: section.categories,
                  task: section.task,
                  id: section.id,
                },
                { transaction }
              )

              await saveFollowUpQuestions(section.followUpQuestions, {
                CardSortingId: newCardSorting.id,
              })
            }
          }

          if (designSurvey) {
            let key: QuestionIndex
            let newDesignSurvey: DesignSurvey

            for (key in designSurvey) {
              const section = designSurvey[key]

              const fileNames = getFileNames()

              newDesignSurvey = await DesignSurvey.create(
                {
                  createdBy: user.id,
                  index: Number(key),
                  testId: createTest.id,
                  fileType: section.fileType,
                  fileURL: fileNames[0],
                  frameType: section.frameType,
                  id: section.id,
                },
                { transaction }
              )

              await saveFollowUpQuestions(section.followUpQuestions, {
                DesignSurveyId: newDesignSurvey.id,
              })

              await uploadFile({
                req,
                config: {
                  path: `/user/${userId}/tests/DesignSurvey/${section.id}/`,
                  keys: [section.id],
                  fileNames,
                },
                fileData: {
                  createdBy: userId,
                  createdFor: createTest.id,
                },
                transaction,
              })
            }
          }

          if (fiveSecondsTest) {
            let key: QuestionIndex
            let newFiveSecondsTest: FiveSecondsTest

            for (key in fiveSecondsTest) {
              const section = fiveSecondsTest[key]

              const fileNames = getFileNames()

              newFiveSecondsTest = await FiveSecondsTest.create(
                {
                  createdBy: user.id,
                  index: Number(key),
                  testId: createTest.id,
                  id: section.id,
                  duration: Number(
                    section.duration
                  ) as FiveSecondsTest['duration'],
                  fileURL: fileNames[0],
                },
                { transaction }
              )

              await saveFollowUpQuestions(section.followUpQuestions, {
                FiveSecondsTestId: newFiveSecondsTest.id,
              })

              await uploadFile({
                req,
                config: {
                  path: `/user/${userId}/tests/FiveSecondsTest/${section.id}/`,
                  keys: [section.id],
                  fileNames,
                },
                fileData: {
                  createdBy: userId,
                  createdFor: createTest.id,
                },
                transaction,
              })
            }
          }

          if (customMessage) {
            let key: QuestionIndex

            for (key in customMessage) {
              const section = customMessage[key]

              await CustomMessage.create(
                {
                  createdBy: user.id,
                  index: Number(key),
                  testId: createTest.id,
                  id: section.id,
                  message: section.message,
                  title: section.title,
                },
                { transaction }
              )
            }
          }

          if (websiteEvaluation) {
            let key: QuestionIndex

            for (key in websiteEvaluation) {
              const section = websiteEvaluation[key]

              const newRecord = await WebsiteEvaluation.create(
                {
                  createdBy: user.id,
                  index: Number(key),
                  testId: createTest.id,
                  task: section.task,
                  id: section.id,
                  websiteLink: (
                    section as CreateTestForm['WebsiteEvaluation']['0']
                  ).websiteLink,
                },
                { transaction }
              )

              await saveFollowUpQuestions(section.followUpQuestions, {
                WebsiteEvaluationId: newRecord.id,
              })
            }
          }

          if (prototypeEvaluation) {
            let key: QuestionIndex

            for (key in prototypeEvaluation) {
              const section = prototypeEvaluation[key]

              const newRecord = await PrototypeEvaluation.create(
                {
                  createdBy: user.id,
                  index: Number(key),
                  testId: createTest.id,
                  task: section.task,
                  id: section.id,
                  prototypeLink: (
                    section as CreateTestForm['PrototypeEvaluation']['0']
                  ).prototypeLink,
                  prototypeProvider: 'figma',
                },
                { transaction }
              )

              await saveFollowUpQuestions(section.followUpQuestions, {
                PrototypeEvaluationId: newRecord.id,
              })
            }
          }

          if (preferenceTest) {
            let key: QuestionIndex
            let newPreferenceTest: PreferenceTest

            for (key in preferenceTest) {
              const section = preferenceTest[key]

              const fileNames = getFileNames(section.files)

              newPreferenceTest = await PreferenceTest.create(
                {
                  createdBy: user.id,
                  index: Number(key),
                  testId: createTest.id,
                  id: section.id,
                  fileURLs: fileNames,
                },
                { transaction }
              )

              await saveFollowUpQuestions(section.followUpQuestions, {
                PreferenceTestId: newPreferenceTest.id,
              })

              await uploadFile({
                req,
                config: {
                  path: `/user/${userId}/tests/PreferenceTest/${section.id}/`,
                  keys: [section.id],
                  fileNames,
                },
                fileData: {
                  createdBy: userId,
                  createdFor: createTest.id,
                },
                transaction,
              })
            }
          }

          await transaction.commit()

          sendSuccess(res, {
            data: [createTest.get()],
            message: {
              content: 'Test created!',
              type: 'success',
            },
          })
        } else {
          await transaction.rollback()

          throw new Error('Error creating test at this time.')
        }
      } catch (err: any) {
        sendFormattedError(err, res)
      }
    }
  )
}
