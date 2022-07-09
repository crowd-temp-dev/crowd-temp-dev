import { RequestHandler, Router } from 'express'
import Joi from 'joi'
import { sendError, sendFormattedError, sendSuccess } from '../../utils/sendRes'
import { TemporaryEmail } from '../../../database/models/User/TemporaryEmail'
import { User } from '../../../database/models/User/User'
import DB from '../../../database'

const formValidation: RequestHandler = (req, res, next) => {
  const body = req.body

  const schema = Joi.object({
    token: Joi.string().uuid({ version: 'uuidv4' }).required(),
    id: Joi.string().uuid({ version: 'uuidv4' }).required(),
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
  return router.post(
    '/auth/cancelEmailChange',
    formValidation,
    async (req, res) => {
      const { token, id } = req.body

      try {
        await DB.transaction(async (transaction) => {
          // check that the token exists;
          const temporaryEmail = await TemporaryEmail.findByPk(token, {
            transaction,
          })

          if (temporaryEmail) {
            // check user exists
            const user = await User.findByPk(id, { transaction })

            if (user) {
              if (user.provider !== 'email') {
                throw new Error(
                  `{403} ${user.provider} manages account email!`
                )
              }

              await temporaryEmail.destroy({ transaction })

              sendSuccess(res, {
                data: user.get(),
                message: {
                  content: 'Email change cancelled!',
                  type: 'success',
                },
              })
            } else {
              throw new Error("{403} This account doesn't exist!")
            }
          } else {
            throw new Error('{403} Cannot cancel email change!')
          }
        })
      } catch (err) {
        sendFormattedError(err, res)
      }
    }
  )
}
