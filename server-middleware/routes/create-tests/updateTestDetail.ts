import { RequestHandler, Router } from 'express'
import Joi from 'joi'
import { sendError, sendFormattedError, sendSuccess } from '../../utils/sendRes'
import DB from '../../../database'
import { uuidv4 } from '../../utils/validation'
import { authMiddleware } from '../../utils/middleware'
import { TestDetail } from '../../../database/models/CreateTests/TestDetail'
import { removeUndefinedValues } from '../../../utils'

export interface UpdateTestDetailForm {
  id: string
  unlimitedInvites?: boolean
  stopAcceptingResponse?: boolean
}

const formValidation: RequestHandler = (req, res, next) => {
  const body = req.body

  const schema = Joi.object({
    id: uuidv4.required(),
    unlimitedInvites: Joi.boolean(),
    stopAcceptingResponse: Joi.boolean(),
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
  return router.patch(
    '/create-test/updateDetail',
    formValidation,
    authMiddleware,
    async (req, res) => {
      const { id, stopAcceptingResponse, unlimitedInvites } =
        req.body as UpdateTestDetailForm

      const { userId } = req.signedCookies

      try {
        await DB.transaction(async (transaction) => {
          // find the test and match the creator's id;
          const testDetail = await TestDetail.findByPk(id, {
            transaction,
          })

          if (testDetail) {
            if (testDetail.createdBy !== userId) {
              throw new Error('{403} You cannot access this test!')
            }

            if (testDetail.published) {
              const updateValues = removeUndefinedValues({
                stopAcceptingResponse,
                unlimitedInvites,
              })

              await testDetail.update(updateValues)

              await testDetail.save({ transaction })

              await testDetail.reload({ transaction })

              sendSuccess(res, {
                data: {
                  published: true,
                  shareLink: testDetail.shareLink,
                  stopAcceptingResponse: testDetail.stopAcceptingResponse,
                  unlimitedInvites: testDetail.unlimitedInvites,
                },
                message: {
                  content: 'Updated!',
                  type:'success'
                }
              })
            } else {
              throw new Error('{403} Only published test can be updated!')
            }
          } else {
            throw new Error('{404} Test not found!')
          }
        })
      } catch (err) {
        sendFormattedError(err, res)
      }
    }
  )
}
