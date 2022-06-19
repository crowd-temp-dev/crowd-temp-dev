import { RequestHandler, Router } from 'express'
import Joi from 'joi'
import { sendError, sendFormattedError, sendSuccess } from '../../utils/sendRes'
import DB from '../../../database'
import { AnswerTestUser } from '../../../database/models/AnswerTest/User'
import { TestAnswer } from '../../../database/models/AnswerTest/Answers'
import { verifyAnsUser } from '../../utils/middleware'
import { getFullTest } from '../../../database/models/CreateTests/utils'
import { getAlphabetIndex, otherChoicePrefix } from '../../../utils'
import { getCurrentTestIndex } from '../../utils/answerTest'

export interface GetUserRes {
  sendTo?: string
}

export interface AnswerQuestionForm {
  shareLink: string
  values: any[]
  config?: {
    addOtherAsChoice: boolean
  }
}

const formValidation: RequestHandler = (req, res, next) => {
  const schema = {
    shareLink: Joi.string()
      .pattern(/^cid-(?:[0-9a-zA-Z-]+)$/)
      .required(),
    values: Joi.array().items(Joi.string()).required(),
    config: Joi.object({
      addOtherAsChoice: Joi.boolean(),
    }),
  }

  const validate = Joi.object(schema).validate(req.body)

  if (validate.error) {
    return sendError(res, {
      message: {
        content: validate.error.message || 'Invalid credentials',
        type: 'error',
      },
      status: 400,
    })
  }

  next()
}

export default function (router: Router) {
  return router.post(
    '/answer-test/answerQuestion',
    formValidation,
    verifyAnsUser,
    async (req, res) => {
      try {
        const { ansUserId, testId } = req.signedCookies

        if (!testId) {
          throw new Error('{404} Test not found!')
        }

        await DB.transaction(async (transaction) => {
          // get user
          const user = await AnswerTestUser.findByPk(ansUserId, {
            transaction,
          })

          if (!user) {
            throw new Error('{404} User not found!')
          }

          // use user's current index to find the type of question to answer.
          // if values matches, answer, else bail
          const currentIndex = user.currentIndex[testId]

          if (currentIndex === 'done') {
            throw new Error('{403} You have completed this test!')
          }

          if (/^\d+[a-z]$/.test(currentIndex)) {
            const qIndex = Number((currentIndex.match(/^\d+/g) || [])[0])

            const qIndexLetter = (
              (currentIndex.match(/\d[a-z]$/g) || [])[0] || ''
            ).replace(/\d/g, '')

            if (!qIndex || !qIndexLetter) {
              throw new Error('{403} Invalid question!')
            } else {
              const { data } = await getFullTest(testId, transaction)

              if (!data) {
                throw new Error('{404} Test not found!')
              } else {
                // find the answer table
                const answer = await TestAnswer.findOne({
                  where: {
                    userId: ansUserId,
                    testId,
                  },
                  transaction,
                })

                if (!answer) {
                  throw new Error('{404} Answers not found! Report!')
                }

                const values = req.body.values as string[]

                const currentQuestion = data[`question-${qIndex}`]

                // only check types for question with followups
                if (currentQuestion.followUpQuestions) {
                  const followUpQuestion =
                    currentQuestion.followUpQuestions[
                      getAlphabetIndex(qIndexLetter)
                    ]

                  const indexes = res.get('qIndexes')

                  if (!indexes) {
                    throw new Error('{404} Indexes not found! Report issue!')
                  }

                  // update user's currentIndex
                  const parseIndexes = indexes as unknown as (
                    | `confirm-${number}${string}`
                    | `${number}${string}`
                    | 'done'
                  )[]

                  const nextIndexValue =
                    parseIndexes[
                      parseIndexes.indexOf(user.currentIndex[testId]) + 1
                    ] || 'done'

                  const saveProgressAndSendRes = async (ans: any) => {
                    await answer.update({
                      answers: {
                        ...answer.answers,
                        [currentIndex]: ans,
                      },
                      done: nextIndexValue === 'done'
                    })

                    await answer.save({ transaction })

                    await user.update({
                      currentIndex: {
                        ...user.currentIndex,
                        [testId]: nextIndexValue,
                      },
                    })

                    await user.save({ transaction })

                    sendSuccess(res, {
                      data: {
                        sendTo: getCurrentTestIndex(data, nextIndexValue),
                      },
                    })
                  }

                  // check short text or long text
                  if (
                    ['short-text', 'long-text'].includes(followUpQuestion.type)
                  ) {
                    // check to see value isn't longer than 255
                    if (
                      values[0].length <=
                      (followUpQuestion.type === 'short-text' ? 255 : 999)
                    ) {
                      await saveProgressAndSendRes(values[0])
                    } else {
                      throw new Error('{400} Your answer is too long!')
                    }
                  }

                  // check multichoice or checkbox
                  if (
                    ['multi-choice', 'checkbox'].includes(followUpQuestion.type)
                  ) {
                    if (values.some((value) => value.length > 255)) {
                      throw new Error('{400} Value(s) too long!')
                    }

                    // check if any value is nullish
                    if (values.some((value) => !value)) {
                      throw new Error('{400} Cannot submit empty value')
                    }

                    // only accept 1 question for multi-choice
                    if (
                      followUpQuestion.type === 'multi-choice' &&
                      values.length !== 1
                    ) {
                      throw new Error(
                        '{400} Multi choice answer must be 1 value'
                      )
                    }

                    const { maxSelection, options, addOtherAsChoice } =
                      followUpQuestion.choices

                    // check max values for checbkox
                    if (
                      values.length >
                      Number(maxSelection || 50) + (addOtherAsChoice ? 1 : 0)
                    ) {
                      throw new Error(`Max selection is ${maxSelection}`)
                    }

                    const validValues = values
                      .filter((val) => !val.startsWith(otherChoicePrefix))
                      .every((val) => options.includes(val))

                    if (!validValues) {
                      throw new Error('{400} Invalid choice')
                    }

                    const filterValues = values.map((x) =>
                      x.replace(otherChoicePrefix, '')
                    )

                    await saveProgressAndSendRes(filterValues)
                  }

                  // check linear-scale
                  if (followUpQuestion.type === 'linear-scale') {
                    if (values.length !== 1) {
                      throw new Error('{400} Length of value must be 1')
                    }
                    // check to see value is valid
                    const numberValue = Number(values[0])

                    const { linearScale } = followUpQuestion

                    if (
                      !numberValue ||
                      numberValue < Number(linearScale.start.value) ||
                      numberValue > Number(linearScale.end.value)
                    ) {
                      throw new Error('{400} Invalid value')
                    }

                    await saveProgressAndSendRes(numberValue.toString())
                  }

                  throw new Error('{400} Feature not implemented!')
                } else {
                  sendSuccess(res, { data: 1 })
                }
              }
            }
          } else {
            throw new Error('{403} Invalid question!')
          }
        })
      } catch (err) {
        console.log(err)

        sendFormattedError(err, res, {
          sendTo: '/',
          help: 1,
        })
      }
    }
  )
}
