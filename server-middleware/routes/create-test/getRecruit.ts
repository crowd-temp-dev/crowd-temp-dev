import { RequestHandler, Router } from 'express'
import Joi from 'joi'
import { sendError, sendFormattedError, sendSuccess } from '../../utils/sendRes'
import DB from '../../../database'
import { uuidv4 } from '../../utils/validation'
import { authenticate } from '../../utils/middleware'
import { TestDetail } from '../../../database/models/CreateTests/TestDetail'

const formValidation: RequestHandler = (req, res, next) => {
  const body = req.params

  const schema = Joi.object({
    id: uuidv4.required(),
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
  return router.get(
    '/create-test/recruit/:id',
    formValidation,
    authenticate,
    async (req, res) => {
      const id = req.params.id as string

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
              sendSuccess(res, {
                data: {
                  published: true,
                  shareLink: testDetail.shareLink,
                  stopAcceptingResponse: testDetail.stopAcceptingResponse,
                  unlimitedInvites: testDetail.unlimitedInvites,
                },
              })
            } else {
              sendSuccess(res, {
                data: {
                  published: false,
                },
              })
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
