import { RequestHandler, Router } from 'express'
import Joi from 'joi'
import { sendError, sendFormattedError, sendSuccess } from '../../utils/sendRes'
import DB from '../../../database'
import { AnswerTestUser } from '../../../database/models/AnswerTest/User'
// import { TestAnswer } from '../../../database/models/AnswerTest/Answers'
import { verifyAnsUser } from '../../utils/middleware'
import { getCurrentTestIndex } from '../../utils/answerTest'
import getFullTestFromSession from './utils'

export interface GetUserRes {
  nextIndex: string
}

const formValidation: RequestHandler = (req, res, next) => {
  const validate = Joi.object({
    // shareLink: Joi.string()
    //   .pattern(/^cid-(?:[0-9a-zA-Z-]+)$/)
    //   .required(),
    value: Joi.array().items(Joi.any()),
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
    '/answer-test/confirmSection',
    formValidation,
    verifyAnsUser,
    async (req, res) => {
      try {
        const { ansUserId, testId } = req.signedCookies

        if (!ansUserId || !testId) {
          throw new Error('Cannot confirm section at this time. Report!')
        }

        await DB.transaction(async (transaction) => {
          // get user
          const user = await AnswerTestUser.findByPk(ansUserId, {
            transaction,
          })

          if (!user) {
            throw new Error('{404} User not found!')
          }

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
            parseIndexes[parseIndexes.indexOf(user.currentIndex[testId]) + 1] ||
            'done'

          if (nextIndexValue !== 'done') {
            // if (req.body.value) {
            //   const answer = await TestAnswer.findOne({
            //     where: {
            //       userId: ansUserId,
            //       testId,
            //     },
            //     transaction,
            //   })

            //   if (!answer) {
            //     throw new Error('{404} Question not found!')
            //   }

            //   const currentIndex = user.currentIndex[testId]

            //   const { value } = req.body

            //   // check that the values are valid
            //   // if()

            //   await answer.update({
            //     answers: {
            //       ...answer.answers,
            //       [currentIndex]: req.body.value,
            //     },
            //   })

            //   await answer.save({ transaction })
            // }

            await user.update({
              currentIndex: {
                ...user.currentIndex,
                [testId]: nextIndexValue,
              },
            })

            await user.save({ transaction })
          } else {
            throw new Error('{403} You have completed this test!')
          }

          const { data } = await getFullTestFromSession({
            res,
            req,
            testId,
            transaction,
            includeId: true,
          })

          sendSuccess(res, {
            data: {
              nextIndex: getCurrentTestIndex(data, nextIndexValue),
            },
          })
        })
      } catch (err) {
        sendFormattedError(err, res, {
          sendTo: '/',
        })
      }
    }
  )
}
