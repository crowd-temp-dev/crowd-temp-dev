import { RequestHandler, Router } from 'express'
import Joi from 'joi'
import { sendError, sendFormattedError, sendSuccess } from '../../utils/sendRes'
import DB from '../../../database'
import { AnswerTestUser } from '../../../database/models/AnswerTest/User'
import { TestAnswer } from '../../../database/models/AnswerTest/Answers'
import { verifyAnsUser } from '../../utils/middleware'
import { getCurrentTestIndex } from '../../utils/answerTest'
import getFullTestFromSession from './utils'
import { CreateTestForm } from '~/types/form'

export interface GetUserRes {
  sendTo?: string
  fullTest?: CreateTestForm | null
  username?: string
}

const formValidation: RequestHandler = (req, res, next) => {
  const validate = Joi.object({
    shareLink: Joi.string()
      .pattern(/^cid-(?:[0-9a-zA-Z-]+)$/)
      .required(),
  }).validate(req.params)

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
  return router.get(
    '/answer-test/getUser/:shareLink',
    formValidation,
    verifyAnsUser,
    async (req, res) => {
      try {
        await DB.transaction(async (transaction) => {
          // at this point, signedCookies should be populated.
          // check verifyAnsUser middleware for bugs if not.
          const { ansUserId, testId, shareLink } = req.signedCookies

          const user = await AnswerTestUser.findByPk(ansUserId, { transaction })

          if (!user) {
            // edge case
            throw new Error('{404} User not found!!')
          }

          const testAnswers = await TestAnswer.findOne({
            where: DB.and([{ userId: ansUserId }, { testId }]),
            transaction,
          })

          const { data } = await getFullTestFromSession({
            res,
            req,
            testId,
            transaction,
            includeId: true,
          })

          const userCurrentIndex = user.currentIndex[testId]

          // send new users back to start screen
          if (!testAnswers || userCurrentIndex === '0a') {
            sendSuccess(res, {
              data: {
                sendTo: shareLink,
                fullTest: data,
                username: testAnswers?.username,
              } as unknown as GetUserRes,
            })
          } else {
            // send user to the current index they're on
            sendSuccess(res, {
              data: {
                sendTo: `${shareLink}/${getCurrentTestIndex(
                  data,
                  userCurrentIndex
                )}`,
                fullTest: data,
                username: testAnswers.username,
              } as unknown as GetUserRes,
            })
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
