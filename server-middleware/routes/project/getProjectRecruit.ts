import { RequestHandler, Router } from 'express'
import Joi from 'joi'
import { sendError, sendFormattedError, sendSuccess } from '../../utils/sendRes'
import DB from '../../../database'
import { uuidv4 } from '../../utils/validation'
import { authenticate } from '../../utils/middleware'
import { TestDetail } from '../../../database/models/Project/TestDetail'
import { TestAnswer } from '../../../database/models/AnswerTest/Answers'

export interface GetRecruitRes {
  created?: boolean
  name: string
  participants: number
  published: boolean
  responses: number
  shareLink: string
  stopAcceptingResponse: boolean
  unlimitedInvites: boolean
}

const formValidation: RequestHandler = (req, res, next) => {
  const body = req.params

  const schema = Joi.object({
    id: uuidv4.required(),
  })

  const validate = schema.validate(body)

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
    '/project/recruit/:id',
    formValidation,
    authenticate,
    async (req, res) => {
      const id = req.params.id as string

      const { userId } = req.signedCookies

      try {
        await DB.transaction(async (transaction) => {
          // find the test and match the creator's id;
          const testDetail = await TestDetail.findByPk(id, {
            transaction,
          })

          if (testDetail) {
            if (testDetail.createdBy !== userId) {
              throw new Error('{403} You cannot access this test!')
            }

            const participants = await TestAnswer.count({
              where: { testId: id },
              transaction,
            })

            const responses = await TestAnswer.count({
              where: { done: true, testId: id },
              transaction,
            })

            sendSuccess(res, {
              data: {
                published: testDetail.published,
                name: testDetail.name,
                ...(testDetail.published
                  ? {
                      shareLink: testDetail.shareLink,
                      stopAcceptingResponse: testDetail.stopAcceptingResponse,
                      unlimitedInvites: testDetail.unlimitedInvites,
                      participants,
                      responses,
                      created: true,
                    }
                  : {}),
              },
            })
          } else {
            throw new Error('{404} Test not found!')
          }
        })
      } catch (err) {
        sendFormattedError(err, res)
      }
    }
  )
}
