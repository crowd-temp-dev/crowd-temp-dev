import { RequestHandler, Router } from 'express'
import Joi from 'joi'
import { sendError, sendFormattedError, sendSuccess } from '../../utils/sendRes'
import DB from '../../../database'
import { uuidv4 } from '../../utils/validation'
import { authenticate } from '../../utils/middleware'
import { TestDetail } from '../../../database/models/CreateTests/TestDetail'
import { getFullTest } from '../../../database/models/CreateTests/utils'
import { TestAnswer } from '../../../database/models/AnswerTest/Answers'

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
    '/create-test/:id',
    formValidation,
    authenticate,
    async (req, res) => {
      const id = req.params.id as string

      const { userId } = req.signedCookies

      try {
        await DB.transaction(async (transaction) => {
          // find the test and match the creator's id;
          const test = await TestDetail.findByPk(id, {
            transaction,
          })

          if (test) {
            if (test.createdBy !== userId) {
              throw new Error('{403} You cannot access this test!')
            }

            const result = await getFullTest(id, transaction)

            const getParticipants = await TestAnswer.count({
              where: { testId: id },
              transaction,
            })

            const participants = getParticipants
              ? {
                  participants: getParticipants,
                }
              : {}

            sendSuccess(res, {
              data: {
                form: result.data,
                details: {
                  published: test.published,
                  created: !!result.data.testDetails,
                  name: test.name,
                  ...participants,
                },
              },
            })
          } else {
            sendSuccess(res, {
              data: {
                form: {
                  empty: true,
                },
                details: {
                  created: false,
                },
              },
            })
          }
        })
      } catch (err) {
        sendFormattedError(err, res)
      }
    }
  )
}
