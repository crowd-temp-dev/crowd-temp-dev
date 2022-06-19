import { RequestHandler, Router } from 'express'
import Joi from 'joi'
import { sendError, sendFormattedError, sendSuccess } from '../../utils/sendRes'
import DB from '../../../database'
import { authenticate } from '../../utils/middleware'
import { TestDetail } from '../../../database/models/CreateTests/TestDetail'
import { TestAnswer } from '../../../database/models/AnswerTest/Answers'
import { CreateTestProgress } from '~/server-middleware/types'

export interface GetAllTestsForm {
  favourite?: boolean
  limit?: number
  offset?: number
  // sort?:
}

export type GetAllTestsRes = Record<
  `${number}`,
  {
    createdAt: string
    description: string
    favourite: boolean
    id: string
    name: string
    progress: CreateTestProgress
    published: boolean
    responseCount: string
    shareLink: string
  }
>[]

const formValidation: RequestHandler = (req, res, next) => {
  const body = req.query

  const schema = Joi.object({
    favourite: Joi.boolean(),
    limit: Joi.number().integer().min(1).max(1000),
    offset: Joi.number().integer().min(0).max(100),
  } as Record<keyof GetAllTestsForm, any>)

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
    '/get-test/getAll',
    formValidation,
    authenticate,
    async (req, res) => {
      const { userId } = req.signedCookies

      try {
        await DB.transaction(async (transaction) => {
          // find the test and match the creator's id;
          const testDetail = await TestDetail.findAll({
            where: {
              createdBy: userId,
            },
            include: {
              model: TestAnswer,
              attributes: [],
            },
            transaction,
            attributes: [
              [DB.fn('COUNT', 'TestAnswers.done'), 'responses'],
              'id',
              'favourite',
              'name',
              'published',
              'description',
              'shareLink',
              'createdAt',
              'progress'
            ],
            group: ['TestDetail.id', 'TestAnswers.id'],
          })

          sendSuccess(res, {
            data: testDetail
          })
        })
      } catch (err) {
        sendFormattedError(err, res)
      }
    }
  )
}
