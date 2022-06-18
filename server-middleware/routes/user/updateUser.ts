import { RequestHandler, Router } from 'express'
import Joi from 'joi'
import { MessageObject, UserData } from '../../types'
import { authMiddleware } from '../../utils/middleware'
import { sendError, sendFormattedError, sendSuccess } from '../../utils/sendRes'
import { user } from '../../utils/validation'
import DB from '../../../database'
import { removeUndefinedValues } from '../../../utils'
import { User } from '../../../database/models/User/User'
import { TemporaryEmail } from '../../../database/models/User/TemporaryEmail'
import mailer from '../../email'
import { apiActionQuery } from '../../utils'
import { setAuthCookies } from '../../utils/cookies'

const formValidation: RequestHandler = (req, res, next) => {
  const body = req.body

  const schema = Joi.object({
    name: user.name,
    email: user.email,
    newsUpdate: Joi.boolean(),
    role: user.role,
    showDashboardGuide: Joi.boolean(),
  } as Record<keyof UserData, any>)

  const validate = schema.validate(body)

  if (validate.error) {
    return sendError(res, {
      message: {
        content: validate.error.message || 'Invalid value(s)',
        type: 'error',
      },
      status: 400,
    })
  }

  next()
}

export default function (router: Router) {
  return router.patch(
    '/auth/update',
    formValidation,
    authMiddleware,
    async (req, res) => {
      const { userId } = req.signedCookies

      try {
        if (!userId) {
          throw new Error('{401} You must be logged in!')
        }

        await DB.transaction(async (transaction) => {
          // get user
          const user = await User.findByPk(userId, {
            transaction,
          })

          if (user) {
            const { email, name, newsUpdate, role, showDashboardGuide } =
              req.body as UserData

            // update fields, if email is changed, send confirmation and add email to TemporaryEmail
            const updateValues = removeUndefinedValues({
              name,
              newsUpdate,
              role,
              showDashboardGuide,
            }) as UserData

            await user.update(updateValues)

            await user.save({ transaction }).catch(() => {
              throw new Error('{409} Update failed! Try again later.')
            })

            const messages: MessageObject[] = []

            // email changed
            if (email) {
              const clearAllTempEmails = async () => {
                await TemporaryEmail.destroy({
                  where: {
                    userId: user.id,
                  },
                  transaction,
                })
              }

              if (email !== user.email) {
                // check to see that the new email isn't a confirmed user's email
                const emailExists = await User.findOne({
                  where: { email, confirmed: true },
                  attributes: ['email'],
                  transaction,
                })

                if (emailExists) {
                  throw new Error('{403} Update failed! Email exists.')
                }

                // create a new temporary email and send confirmation to both emails
                await clearAllTempEmails()

                const temporaryEmail = await TemporaryEmail.create(
                  {
                    userId: user.id,
                    email,
                  },
                  { transaction }
                )

                if (temporaryEmail) {
                  mailer
                    .sendMail({
                      from: 'UnbugQA',
                      to: user.email,
                      subject: 'Change of email',
                      html: `<div>
                      <p>
                        Hi ${user.name
                        }! A request has been made to change your email!.
                      </p>

                      <p>
                        <p><strong>This wasn't you?</strong></p>
                        <a href="${process.env.CLIENT_ORIGIN}/action?${apiActionQuery({
                          key: 'cancel_email_change',
                          token: temporaryEmail.id,
                          id: user.id,
                        })}">Cancel this request</a>
                      </p>
                    </div>`,
                    })
                    .then(() => {
                      mailer.sendMail({
                        from: 'UnbugQA',
                        to: email,
                        subject: 'Confirm new email',
                        html: `<div>
                      <p>
                        Hi ${user.name
                          }! A request was made to change your old email <em>${user.email
                          }</em> to this one.
                      </p>

                      <a href="${process.env.CLIENT_ORIGIN}/action?${apiActionQuery({
                            key: 'change_email',
                            token: temporaryEmail.id,
                            id: user.id,
                          })}">Change email</a>

                      <p>
                        <p><strong>This wasn't you?</strong></p>
                        <a href="${process.env.CLIENT_ORIGIN}/action?${apiActionQuery({
                            key: 'cancel_email_change',
                            token: temporaryEmail.id,
                            id: user.id,
                          })}">Cancel this request</a>
                      </p>
                    </div>`,
                      })
                    })

                  messages.push({
                    content: 'Confirm your new email!',
                    type: 'success',
                    duration: 7000,
                  })
                } else {
                  throw new Error('{409} Cannot update your email at this time!')
                }
              } else {
                await clearAllTempEmails()
              }
            }

            setAuthCookies(req, res, user)

            sendSuccess(res, {
              data: user.get(),
              message: [
                {
                  content: "Updated!",
                  type: "success"
                },
                ...messages
              ]
            })
          } else {
            throw new Error('{404} Account not found!')
          }
        })
      } catch (err) {
        sendFormattedError(err, res)
      }
    }
  )
}
