import Joi from 'joi'
import { RequestHandler, Router } from 'express'
import { user as userValidation } from '../../utils/validation'
import { sendError, sendFormattedError, sendSuccess } from '../../utils/sendRes'
import { setAuthCookies } from '../../utils/cookies'
import { apiActionQuery, loggedInMessage } from '../../utils'
import DB from '../../../database'
import { User } from '../../../database/models/User/User'
import { inOneDay, uuidv4 } from '../../../utils'
import { matchPassword } from '../../../database/utils'
import mailer from '../../email'

export interface LoginForm {
  email: string
  password: string
}

const middleware: RequestHandler = (req, res, next) => {
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
  return router.post('/auth/login', middleware, async (req, res) => {
    const { email, password } = req.body as LoginForm

    try {
      await DB.transaction(async (transaction) => {
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
              const session = uuidv4()

              const actionToken = uuidv4()

              await user.update({
                action: {
                  ...user.action,
                  [actionToken]: inOneDay() * 2,
                },
              })

              await setAuthCookies(req, res, user, session)

              if (process.env.NODE_ENV === 'production') {
                mailer.sendMail({
                  from: 'UnbugQA',
                  to: user.email,
                  subject: 'New Login!',
                  html: `<div>
                      <p>
                        Hi ${
                          user.name
                        }! A new login has occured on your account!.
                      </p>

                      <p>
                        <p><strong>This wasn't you?</strong></p>
                        <a href="${
                          process.env.CLIENT_ORIGIN
                        }/action?${apiActionQuery({
                    key: 'end_all_sessions',
                    token: actionToken,
                    id: user.id,
                  })}">Sign out of all sessions</a>
                      </p>
                    </div>`,
                })
              }

              sendSuccess(res, {
                message: loggedInMessage(user),
                data: user.get(),
              })
            } else throwIncorrectCredentials()
          } else {
            throw new Error('{403} Confirm your account first!')
          }
        } else throwIncorrectCredentials()
      })
    } catch (err) {
      sendFormattedError(err, res)
    }
  })
}
