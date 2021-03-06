import { RequestHandler, Router } from 'express'
import Joi from 'joi'
import { sendError, sendFormattedError, sendSuccess } from '../../utils/sendRes'
import DB from '../../../database'
import { authenticate } from '../../utils/middleware'
import { TestDetail } from '../../../database/models/Project/TestDetail'
import { removeUndefinedValues } from '../../../utils'
import { TestAnswer } from '../../../database/models/AnswerTest/Answers'
import { ProjectProgress } from '~/server-middleware/types'

export interface GetAllTestsForm {
  favourite?: boolean
  limit?: number
  offset?: number
  // sort?:
}

export interface GetAllTestsResItem {
  createdAt: string
  description: string
  favourite: boolean
  id: string
  name: string
  progress: ProjectProgress
  published: boolean
  shareLink: string
  responses: number
  TestAnswers: TestAnswer[]
}

export type GetAllTestsRes = GetAllTestsResItem[]

const formValidation: RequestHandler = (req, res, next) => {
  const query = req.query

  const schema = Joi.object({
    favourite: Joi.boolean(),
    limit: Joi.number().integer().min(1).max(1000),
    offset: Joi.number().integer().min(0).max(100),
  } as Record<keyof GetAllTestsForm, any>)

  const validate = schema.validate(query)

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
          const { favourite } = req.body as GetAllTestsForm

          const filter = removeUndefinedValues({
            favourite,
          } as TestDetail)

          // find the test and match the creator's id;
          const testDetail = await TestDetail.findAll({
            where: {
              createdBy: userId,
              ...filter,
            },
            include: {
              association: 'TestAnswers',
            },
            attributes: [
              'id',
              'favourite',
              'name',
              'published',
              'description',
              'shareLink',
              'createdAt',
              'progress',
              'stopAcceptingResponse',
            ],
            group: ['TestDetail.id', 'TestAnswers.id'],
            order: [['createdAt', 'DESC']],
            transaction,
          })

          sendSuccess(res, {
            data: testDetail.map((val) => {
              const output = { ...val.get() } as unknown as GetAllTestsRes[0]

              output.responses = output.TestAnswers.filter((x) => x.done).length

              delete output.TestAnswers

              return output
            }),
          })
        })
      } catch (err) {
        sendFormattedError(err, res)
      }
    }
  )
}
