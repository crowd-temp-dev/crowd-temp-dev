import { RequestHandler, Router } from 'express'
import Joi from 'joi'
import { sendError, sendFormattedError, sendSuccess } from '../../utils/sendRes'
import DB from '../../../database'
import { uuidv4 } from '../../utils/validation'
import { authenticate } from '../../utils/middleware'
import { getFullTest } from '../../../database/models/Project/utils'
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
    '/project/view-result/:id',
    formValidation,
    authenticate,
    async (req, res) => {
      const id = req.params.id as string

      const { userId } = req.signedCookies

      try {
        await DB.transaction(async (transaction) => {
          // find the test and match the creator's id;
          const { data: questions } = await getFullTest(
            id,
            transaction,
            false,
            userId,
            ['shareLink']
          )

          const answers = await TestAnswer.findAll({
            where: {
              testId: id,
            },
            attributes: ['username', 'done', 'answers', 'id'],
            transaction,
          })

          const responses = await TestAnswer.count({
            where: { done: true, testId: id },
            transaction,
          })

          sendSuccess(res, {
            data: {
              questions,
              answers,
              responses,
            },
          })
        })
      } catch (err) {
        sendFormattedError(err, res)
      }
    }
  )
}
