import { Router } from 'express'
import { sendFormattedError, sendSuccess } from '../../utils/sendRes'
import DB from '../../../database'
import { PrivacyAndPolicy } from '../../../database/models/PrivacyAndPolicy/PrivacyAndPolicies'

export default function (router: Router) {
  return router.get('/privacyAndPolicies', async (_, res) => {
    try {
      await DB.transaction(async (transaction) => {
        const data = await PrivacyAndPolicy.findAll({
          transaction,
          attributes: ['updatedAt', 'intro', 'sections'],
        })

        if (data) {
          sendSuccess(res, {
            data,
          })
        } else {
          throw new Error('{404} No policies found! Please report')
        }
      })
    } catch (err) {
      sendFormattedError(err, res)
    }
  })
}
