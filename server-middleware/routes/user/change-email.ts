import { RequestHandler, Router } from 'express'
import Joi from 'joi'
import { sendError, sendFormattedError, sendSuccess } from '../../utils/sendRes'
import { TemporaryEmail } from '../../../database/models/User/TemporaryEmail'
import { User } from '../../../database/models/User/User'
import DB from '../../../database'
import mailer from '../../email'
import { capitalize } from '../../../utils'

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
  return router.post('/auth/changeEmail', formValidation, async (req, res) => {
    const { token, id } = req.body

    try {
      await DB.transaction(async (transaction) => {
        // check that the token exists;
        const temporaryEmail = await TemporaryEmail.findByPk(token, {
          transaction,
        })

        if (temporaryEmail) {
          const destroyToken = async () => {
            await temporaryEmail.destroy({ transaction })
          }

          // check temporaryEmail isn't expired
          if (temporaryEmail.expires < Date.now()) {
            await destroyToken()

            throw new Error('{403} This link has expired!')
          }

          // check user exists
          const user = await User.findByPk(id, { transaction })

          if (user) {
            if (user.provider !== 'email') {
              throw new Error(
                `{403} ${capitalize(user.provider)} manages account email!`
              )
            }

            await user.update({
              email: temporaryEmail.email,
            })

            await user.save({ transaction })

            await user.reload({ transaction })

            await destroyToken()

            mailer.sendMail({
              from: 'UnbugQA',
              to: user.email,
              subject: 'Email changed!',
              html: `<div>
                      <p>
                        Hi ${user.name}! Your email has been updated to this one. Use this to login moving on.
                      </p>
                    </div>`,
            })

            sendSuccess(res, {
              data: user.get(),
              message: {
                content: 'Email changed!',
                type: 'success',
              },
            })
          } else {
            await destroyToken()

            throw new Error("{403} This account doesn't exist!")
          }
        } else {
          throw new Error('{403} Cannot change email!')
        }
      })
    } catch (err) {
      sendFormattedError(err, res)
    }
  })
}
