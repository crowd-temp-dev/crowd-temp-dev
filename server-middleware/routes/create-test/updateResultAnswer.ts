import { RequestHandler, Router } from 'express'
import Joi from 'joi'
import { sendError, sendFormattedError, sendSuccess } from '../../utils/sendRes'
import DB from '../../../database'
import { TestAnswer } from '../../../database/models/AnswerTest/Answers'
import { authenticate } from '../../utils/middleware'
import { uuidv4 } from '../../utils/validation'

export interface UpdateResultAnswerForm {
  id: string
  qIndex: number
  followUpAlpha: string
  values: {
    favourite?: boolean
  }
}

const formValidation: RequestHandler = (req, res, next) => {
  const validate = Joi.object({
    id: uuidv4.required(),
    qIndex: Joi.number().min(0).required(),
    followUpAlpha: Joi.string()
      .pattern(/^[a-z]$/)
      .required(),
    values: Joi.object({
      favourite: Joi.boolean(),
    } as Record<keyof UpdateResultAnswerForm['values'], any>).required(),
  } as Record<keyof UpdateResultAnswerForm, any>).validate(req.body)

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
    '/create-test/view-result/updateAnswer',
    formValidation,
    authenticate,
    async (req, res) => {
      try {
        await DB.transaction(async (transaction) => {
          const { id, followUpAlpha, qIndex, values } = req.body

          // find test by user id, drill down to the question, update question and return truthy
          const questionAnswer = await TestAnswer.findOne({
            where: {
              id,
            },
            transaction,
          })

          if (!questionAnswer) {
            throw new Error('{404} Question not found!')
          }

          const answers = {
            ...questionAnswer.answers,
          }

          const currentQuestion =
            answers[`${qIndex}`].questions[`${followUpAlpha}`]

          const { favourite } = values as typeof currentQuestion

          answers[`${qIndex}`].questions[`${followUpAlpha}`] = {
            ...currentQuestion,
            favourite,
          }

          await TestAnswer.update(
            {
              answers,
            },
            {
              where: { id },
              transaction,
            }
          )

          sendSuccess(res, {
            data: 1,
            message: {
              content: 'Updated!',
              type: 'success',
            },
          })
        })
      } catch (err) {
        sendFormattedError(err, res)
      }
    }
  )
}
