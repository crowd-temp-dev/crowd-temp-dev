import { RequestHandler, Router } from 'express'
import Joi from 'joi'
import { sendError, sendFormattedError, sendSuccess } from '../../utils/sendRes'
import DB from '../../../database'
import { uuidv4 } from '../../utils/validation'
import { authenticate } from '../../utils/middleware'
import { TestDetail } from '../../../database/models/CreateTests/TestDetail'
import { uid } from '../../../utils'

const formValidation: RequestHandler = (req, res, next) => {
  const body = req.body

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
  return router.post(
    '/create-test/publish',
    formValidation,
    authenticate,
    async (req, res) => {
      const id = req.body.id as string

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

            if (testDetail.progress === 'Completed') {
              throw new Error('{403} Too late to publish!')
            }

            await testDetail.update({
              published: true,
              shareLink: uid('cid-'),
              progress: 'Draft: Recruit',
            })

            await testDetail.save({
              transaction,
            })

            await testDetail.reload({ transaction })

            sendSuccess(res, {
              data: {
                published: testDetail.published,
                shareLink: testDetail.shareLink,
                stopAcceptingResponse: testDetail.stopAcceptingResponse,
                unlimitedInvites: testDetail.unlimitedInvites,
              },
              message: {
                content: 'Shareable link created',
                type: 'success',
              },
            })
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
