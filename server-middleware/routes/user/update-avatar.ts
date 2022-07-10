import { Router } from 'express'
import { authenticate } from '../../utils/middleware'
import { sendFormattedError, sendSuccess } from '../../utils/sendRes'
import DB from '../../../database'
import { User } from '../../../database/models/User/User'
import { File } from '../../../database/models/File/File'
import cloudinary from '../fileManager/cloudinary'
import { uploadFile } from '../fileManager/utils'
import { uuidv4 } from '../../../utils'

export default function (router: Router) {
  return router.patch('/auth/update/avatar', authenticate, async (req, res) => {
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
          const hasAvatar = !!user.avatar

          // remove cloudinary image and stored file path
          if ((user.avatar || '').startsWith('file/')) {
            const file = await File.findByPk(user.avatar.replace('file/', ''), {
              transaction,
            })

            if (file) {
              await cloudinary.api.delete_resources([file.id])

              await file.destroy({ transaction })
            }
          }

          const fileId = uuidv4()

          // save to cloudinary
          await uploadFile({
            req,
            config: {
              path: `/user/${userId}/avatar/`,
              keys: ['avatar'],
              fileNames: [fileId],
            },
            fileData: {
              createdBy: userId,
            },
            transaction,
          })

          await user.update({
            avatar: `uploads/${fileId}`,
          })

          await user.save({ transaction })

          sendSuccess(res, {
            data: user.get(),
            message: {
              content: `Avatar ${hasAvatar ? 'updated' : 'uploaded'}!`,
              type: 'success',
            },
          })
        } else {
          throw new Error('{404} Account not found!')
        }
      })
    } catch (err) {
      sendFormattedError(err, res)
    }
  })
}
