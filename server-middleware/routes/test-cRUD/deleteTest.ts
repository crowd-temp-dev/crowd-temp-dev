import { RequestHandler, Router } from 'express'
import Joi from 'joi'
import { sendError, sendFormattedError, sendSuccess } from '../../utils/sendRes'
import DB from '../../../database'
import { authenticate } from '../../utils/middleware'
import { TestDetail } from '../../../database/models/CreateTests/TestDetail'
import { uuidv4 } from '../../utils/validation'
import { User } from '../../../database/models/User/User'

export interface DeleteTestForm {
  id: string
  dontWarn: boolean
}

const formValidation: RequestHandler = (req, res, next) => {
  const body = req.body

  const schema = Joi.object({
    id: uuidv4.required(),
    dontWarn: Joi.boolean(),
  } as Record<keyof DeleteTestForm, any>)

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
  return router.delete(
    '/deleteTest',
    formValidation,
    authenticate,
    async (req, res) => {
      try {
        await DB.transaction(async (transaction) => {
          const { userId } = req.signedCookies

          const { id, dontWarn } = req.body as DeleteTestForm

          const testDetail = await TestDetail.findByPk(id, { transaction })

          if (testDetail) {
            if (testDetail.createdBy !== userId) {
              throw new Error('{401} You cannot delete this test!')
            }

            await testDetail.destroy({ transaction })

            if (dontWarn) {
              const user = await User.findByPk(userId, { transaction })

              if (!user) {
                throw new Error('{401} Account not found!')
              } else {
                await user.update({
                  deleteTestWarn: false,
                })

                await user.save({ transaction })
              }
            }

            sendSuccess(res, {
              data: { id, dontWarn },
              message: {
                content: 'Test deleted!',
                type: 'success',
              },
            })
          } else throw new Error('{404} Test not found!')
        })
      } catch (err) {
        sendFormattedError(err, res)
      }
    }
  )
}
