import { RequestHandler, Router } from 'express'
import Joi from 'joi'
import { sendError, sendFormattedError, sendSuccess } from '../../utils/sendRes'
import DB from '../../../database'

const formValidation: RequestHandler = (req, res, next) => {
  const body = req.body

  const schema = Joi.object({
    query: Joi.string().required(),
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
  return router.post('/db/query', formValidation, async (req, res) => {
    try {
      await DB.transaction(async (transaction) => {
        const data = await DB.query(req.body.query, { transaction })

        sendSuccess(res, {
          data,
        })
      })
    } catch (err) {
      sendFormattedError(err, res)
    }
  })
}
