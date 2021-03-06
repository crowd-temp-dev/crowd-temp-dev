import { Router } from 'express'
import DB from '../../../database'
import { sendError, sendFormattedError, sendSuccess } from '../../utils/sendRes'
import { UserToken } from '../../../database/models/User/UserToken'
import { User } from '../../../database/models/User/User'
import { oneHour } from '../../../utils'
import { authenticate } from '../../utils/middleware'
import mailer from '../../email'
import { setAuthCookies } from '../../utils/cookies'

export default function (router: Router) {
  return router.post(
    '/auth/deleteUser/confirm',
    authenticate,
    async (req, res) => {
      const { userId } = req.signedCookies

      try {
        const transaction = await DB.transaction()

        const user = await User.findByPk(userId, { transaction })

        // delete existing token
        await UserToken.destroy({
          where: {
            userId,
            type: 'delete_account',
          },
          transaction,
        })

        // create new token
        const token = await UserToken.create(
          {
            userId,
            duration: oneHour,
            type: 'delete_account',
          },
          { transaction }
        )

        const [expiresDate, expiresTime] = new Date(
          new Date(token.createdAt).getTime() + token.duration
        )
          .toLocaleString()
          .split(', ')

        mailer
          .sendMail({
            from: 'UnbugQA',
            to: user.email,
            subject: 'Delete account token',
            html: `<div>
                      <p>
                        Hi ${user.firstName}! A request has been made to <strong>delete your account</strong>!.
                      </p>

                      <p>
                        Enter '<strong style="font-size:1.15rem;letter-spacing:0.4px">${token.value}</strong>' in the 'Token' field
                      </p>

                      <em>
                        This token will last for one hour, and will expire on ${expiresDate}, at ${expiresTime}
                      </em>
                    </div>`,
          })
          .then(async () => {
            await setAuthCookies({
              req,
              res,
              transaction,
              userInstance: user,
            })

            await transaction.commit()

            sendSuccess(res, {
              data: [],
              message: {
                content: 'Check your email',
                type: 'success',
              },
            })
          })
          .catch(async (err) => {
            await transaction.rollback()

            console.log({ err })

            sendError(res, {
              message: {
                content: 'Error sending confirmation',
                type: 'error',
              },
            })
          })
      } catch (err: any) {
        sendFormattedError(err, res)
      }
    }
  )
}
