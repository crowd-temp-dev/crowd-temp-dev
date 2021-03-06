import Joi from 'joi'
import { RequestHandler, Router } from 'express'
import {
  sensitiveString,
  user as userValidation,
} from '../../../utils/validation'
import {
  sendError,
  sendFormattedError,
  sendSuccess,
} from '../../../utils/sendRes'
import DB from '../../../../database'
import { User } from '../../../../database/models/User/User'
import { hashPassword } from '../../../../database/utils'
import { UserToken } from '../../../../database/models/User/UserToken'
import { sendVerificationEmail } from './utils'

export interface SignUpForm {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  agreed: boolean
  newsUpdate: boolean
}

const formValidation: RequestHandler = (req, res, next) => {
  const body = req.body

  const schema = Joi.object({
    firstName: sensitiveString
      .min(1)
      .max(99)
      .pattern(/^([a-zA-Z0-9\s-_]){2,255}$/)
      .rule({ message: 'First name should be between 3 and 255 characters.' })
      .required(),
    lastName: sensitiveString
      .min(1)
      .max(99)
      .pattern(/^([a-zA-Z0-9\s-_]){2,255}$/)
      .rule({ message: 'Last name should be between 3 and 255 characters.' })
      .required(),
    email: userValidation.email.required(),
    password: userValidation.password.required(),
    confirmPassword: userValidation.password
      .valid(Joi.ref('password'))
      .required(),
    agreed: Joi.boolean().equal(true).required(),
    newsUpdate: Joi.boolean().required(),
  } as Record<keyof SignUpForm, any>)

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
  return router.post('/auth/signup', formValidation, async (req, res) => {
    try {
      await DB.transaction(async (transaction) => {
        const {
          email: _email,
          password,
          firstName,
          lastName,
          newsUpdate,
        } = req.body as SignUpForm

        const email = _email.toLowerCase().trim()

        // check to see that the email isnt taken.
        const sendRes = async (user: User) => {
          // clear any previous token
          await UserToken.destroy({
            where: {
              userId: user.id,
              type: 'confirm_account',
            },
            transaction,
          })

          // add new token
          const confirmAccount = await UserToken.create(
            {
              userId: user.id,
              type: 'confirm_account',
            },
            { transaction }
          )

          if (confirmAccount) {
            const getToken = confirmAccount.get().id as string

            try {
              const sendConfirmation = await sendVerificationEmail(
                user,
                getToken
              )

              if (sendConfirmation.accepted) {
                sendSuccess(res, {
                  data: {
                    id: user.id,
                    name: `${user.firstName} ${user.lastName}`.trim(),
                    email: user.email,
                  },
                  // message: {
                  //   type: 'success',
                  //   content: 'Confirm account!',
                  //   duration: 5000,
                  // },
                })
              }
            } catch (err) {
              console.log({
                err: {
                  type: 'Sign up email error',
                  err,
                  msg: err?.message || 'No error message',
                },
              })

              throw new Error('{500} Error sending confirmation. Please report')
            }
          } else {
            throw new Error(`{409} Error creating account`)
          }
        }

        const findUser = await User.findOne({
          where: { email },
          transaction,
        })

        const hashedPassword = await hashPassword(password)

        if (findUser) {
          if (findUser.confirmed) {
            throw new Error('{403} Email taken!')
          } else {
            await findUser.update({
              password: hashedPassword,
              firstName,
              lastName,
              role: 'tester',
              newsUpdate,
            })

            await findUser.save({ transaction })

            await findUser.reload({ transaction })

            await sendRes(findUser)
          }
        } else {
          const user = await User.create(
            {
              email: _email,
              firstName,
              lastName,
              password: hashedPassword,
              role: 'tester',
              newsUpdate,
              session: {},
            },
            { transaction }
          )

          if (user) {
            await sendRes(user)
          } else {
            throw new Error(`{409} Error creating account`)
          }
        }
      })
    } catch (err: any) {
      console.log(err.message)

      sendFormattedError(err, res)
    }
  })
}
