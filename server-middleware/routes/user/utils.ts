import { Request, Response } from 'express'
import { Transaction } from 'sequelize/types'
import { setAuthCookies } from '../../utils/cookies'
import { User } from '../../../database/models/User/User'
import { inOneDay, uuidv4 } from '../../../utils'
import mailer from '../../email'
import { apiActionQuery } from '../../utils'

export async function loginUser(arg: {
  user: User
  transaction: Transaction
  req: Request
  res: Response
}) {
  const { req, res, user, transaction } = arg

  const session = uuidv4()

  const actionToken = uuidv4()

  if (!user.confirmed) {
    throw new Error('{401} Account not verified!')
  }

  await user.update({
    action: {
      ...user.action,
      [actionToken]: inOneDay() * 2,
    },
    loginCount: user.loginCount + 1,
  })

  await setAuthCookies({ req, res, transaction, userInstance: user, session })

  if (process.env.NODE_ENV === 'production') {
    mailer.sendMail({
      from: 'UnbugQA',
      to: user.email,
      subject: 'New Login!',
      html: `<div>
                      <p>
                        Hi ${
                          user.firstName
                        }! A new login has occured on your account!.
                      </p>

                      <p>
                        <p><strong>This wasn't you?</strong></p>
                        <a href="${
                          process.env.CLIENT_ORIGIN
                        }/action?${apiActionQuery({
        key: 'end_all_sessions',
        token: actionToken,
        id: user.id,
      })}">Sign out of all sessions</a>
                      </p>
                    </div>`,
    })
  }
}
