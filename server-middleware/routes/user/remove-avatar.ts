import { Router } from 'express'
import { authenticate } from '../../utils/middleware'
import { sendFormattedError, sendSuccess } from '../../utils/sendRes'
import DB from '../../../database'
import { User } from '../../../database/models/User/User'
import { setAuthCookies } from '../../utils/cookies'

export default function (router: Router) {
  return router.patch(
    '/auth/update/removeAvatar',
    authenticate,
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
            await user.update({
              avatar: null
            })

            await user.save({ transaction })

            await setAuthCookies(req, res, user)

            sendSuccess(res, {
              data: user.get(),
              message: [
                {
                  content: 'Avatar removed!',
                  type: 'success',
                },
              ],
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
