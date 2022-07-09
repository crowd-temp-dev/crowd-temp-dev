import Joi from 'joi'
import { RequestHandler, Router } from 'express'
import { user as userValidation } from '../../utils/validation'
import { sendError, sendFormattedError, sendSuccess } from '../../utils/sendRes'
import DB from '../../../database'
import { User } from '../../../database/models/User/User'
import { hashPassword } from '../../../database/utils'
import { UserToken } from '../../../database/models/User/UserToken'
import mailer from '../../email'
import { apiActionQuery } from '../../utils'

export interface SignUpForm {
  name: string
  email: string
  password: string
  confirmPassword: string
  agreed: boolean
  newsUpdate: boolean
}

const formValidation: RequestHandler = (req, res, next) => {
  const body = req.body

  const schema = Joi.object({
    name: userValidation.name.required(),
    email: userValidation.email.required(),
    password: userValidation.password.required(),
    confirmPassword: userValidation.password
      .valid(Joi.ref('password'))
      .required(),
    agreed: Joi.boolean().equal(true).required(),
    newsUpdate: Joi.boolean().required(),
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
  return router.post('/auth/signup', formValidation, async (req, res) => {
    try {
      await DB.transaction(async (transaction) => {
        const {
          email: _email,
          password,
          name,
          newsUpdate,
        } = req.body as SignUpForm

        const email = _email.toLowerCase().trim()

        // const throwErrorCreatingAccount = () => {
        //   throw new Error(`{409} Error creating account`)
        // }

        // check to see that the email isnt taken.
        const sendRes = async (user: User) => {
          // clear any previous token
          await UserToken.destroy({
            where: {
              userId: user.id,
              type: 'confirm_account'
            },
            transaction,
          })

          // add new token
          const confirmAccount = await UserToken.create(
            {
              userId: user.id,
              type: 'confirm_account'
            },
            { transaction }
          )

          if (confirmAccount) {
            const getToken = confirmAccount.get().id as string

            try {
              const sendConfirmation = await mailer.sendMail({
                from: 'UnbugQA',
                to: email,
                subject: 'Confirm your Crowd Testing account',
                html: `<div>
                      <p>
                        Hi ${
                          user.name
                        }! Please click the link below to confirm your account.
                      </p>
                      <p>
                        <strong>
                          <a href="${
                            process.env.CLIENT_ORIGIN
                          }/action?${apiActionQuery({
                  key: 'confirm_account',
                  token: getToken,
                  id: user.id,
                })}">
                            Confirm account
                          </a>
                        </strong>
                      </p>
                    </div>`,
              })

              if (sendConfirmation.accepted) {
                sendSuccess(res, {
                  data: user.get(),
                  message: {
                    type: 'success',
                    content: 'Confirm account!',
                    duration: 5000,
                  },
                })
              }
            } catch (err) {
              console.log({err});
              
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
              name,
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
              name,
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
