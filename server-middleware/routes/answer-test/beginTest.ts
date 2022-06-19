import { RequestHandler, Router } from 'express'
import Joi from 'joi'
import { sendError, sendFormattedError, sendSuccess } from '../../utils/sendRes'
import DB from '../../../database'
import { AnswerTestUser } from '../../../database/models/AnswerTest/User'
import { TestDetail } from '../../../database/models/CreateTests/TestDetail'
import { user } from '../../utils/validation'
import { TestAnswer } from '../../../database/models/AnswerTest/Answers'
import { verifyAnsUser } from '../../utils/middleware'
import { getCurrentTestIndex } from '../../utils/answerTest'
import { getFullTest } from '../../../database/models/CreateTests/utils'

export interface GetUserRes {
  sendTo?: string
  data: any
}

const formValidation: RequestHandler = (req, res, next) => {
  const validate = Joi.object({
    shareLink: Joi.string()
      .pattern(/^cid-(?:[0-9a-zA-Z-]+)$/)
      .required(),
    name: user.name.required(),
  }).validate(req.body)

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
    '/answer-test/beginTest',
    formValidation,
    verifyAnsUser,
    async (req, res) => {
      try {
        const { ansUserId } = req.signedCookies

        await DB.transaction(async (transaction) => {
          // get user
          const user = await AnswerTestUser.findByPk(ansUserId, {
            transaction,
          })

          if (!user) {
            throw new Error('{404} User not found!')
          }

          const testDetail = await TestDetail.findOne({
            where: {
              shareLink: req.body.shareLink,
            },
            transaction,
          })

          if (!testDetail) {
            throw new Error('{404} Test not found!')
          }

          // create a new test if user isn't in progress
          let answerTest: TestAnswer | null = null

          const userCurrentIndex = user.currentIndex[testDetail.id]

          if (userCurrentIndex === '0a') {
            answerTest = await TestAnswer.create(
              {
                testId: testDetail.id,
                userId: user.id,
                username: req.body.name,
              },
              { transaction, returning: ['username'] }
            )
          }

          if (answerTest) {
            const indexes = res.get('qIndexes')

            if (!indexes) {
              throw new Error('{404} Indexes not found! Report issue!')
            }

            // update user's currentIndex
            const parseIndexes = indexes as unknown as (
              | `${number}${string}`
              | 'done'
            )[]

            const nextIndexValue = parseIndexes[1] || 'done'

            if (nextIndexValue !== 'done') {
              await user.update({
                currentIndex: {
                  ...user.currentIndex,
                  [testDetail.id]: nextIndexValue,
                },
              })

              await user.save({ transaction })
            } else {
              throw new Error('{403} You have completed this test!')
            }

            const { data } = await getFullTest(testDetail.id, transaction)            

            sendSuccess(res, {
              data: {
                username: answerTest.username,
                nextIndex: getCurrentTestIndex(data, nextIndexValue),
              },
            })
          } else {
            throw new Error('Cannot begin test at this time!')
          }
        })
      } catch (err) {
        sendFormattedError(err, res, {
          sendTo: '/',
        })
      }
    }
  )
}
