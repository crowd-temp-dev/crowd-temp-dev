import Joi from 'joi'
import { RequestHandler, Router } from 'express'
import { user as userValidation } from '../../utils/validation'
import { sendError, sendFormattedError, sendSuccess } from '../../utils/sendRes'
import { loggedInMessage } from '../../utils'
import DB from '../../../database'
import { User } from '../../../database/models/User/User'
import { matchPassword } from '../../../database/utils'
import { loginUser } from './utils'

export interface LoginForm {
  email: string
  password: string
}

const formValidation: RequestHandler = (req, res, next) => {
  const body = req.body

  const schema = Joi.object({
    email: userValidation.email.required(),
    password: userValidation.password.required(),
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
  return router.post('/auth/login', formValidation, async (req, res) => {
    try {
      await DB.transaction(async (transaction) => {
        const { email, password } = req.body as LoginForm

        const throwIncorrectCredentials = () => {
          throw new Error('{401} Email or password is incorrect!')
        }

        // find user
        const user = await User.findOne({
          where: { email: email.toLowerCase() },
          transaction,
        })

        if (user) {
          // check that user is confirmed;
          if (user.confirmed) {
            // check passwords;
            const passwordMatch = await matchPassword(password, user.password)

            if (passwordMatch) {
              await loginUser({
                user,
                transaction,
                req,
                res,
              })

              await user.save({ transaction })

              sendSuccess(res, {
                message: loggedInMessage(user),
                data: user.get(),
              })
            } else throwIncorrectCredentials()
          } else {
            throw new Error(
              `{403} Confirm your account first! &${JSON.stringify({
                id: user.id,
                email: user.email,
                name: `${user.firstName} ${user.lastName}`.trim(),
              })}&`
            )
          }
        } else throwIncorrectCredentials()
      })
    } catch (err) {
      const dataJSON = err.message.match(/\s&.+&$/g)

      let output: Record<string, any>

      if (dataJSON) {
        output = {
          data: JSON.parse(dataJSON[0].replace(/\s&|&$/g, '')),
          title: 'confirm',
        }
      }

      sendFormattedError(
        {
          ...err,
          message: err.message.replace(/\s&.+&$/, ''),
        },
        res,
        output
      )
    }
  })
}
