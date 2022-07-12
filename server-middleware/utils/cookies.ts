// eslint-disable-next-line import/named
import { Response, Request } from 'express'
import { Transaction } from 'sequelize/types'
import { oneHour } from '../../utils'
import { User } from '../../database/models/User/User'
import { removeSensitiveFields } from '.'

export function clearAuthCookies(res: Response) {
  if (res.headersSent) {
    return
  }

  const expires = new Date()

  res.cookie('token', '', {
    httpOnly: true,
    expires,
    secure: true,
    signed: true,
  })

  res.cookie('userId', '', {
    httpOnly: true,
    expires,
    secure: true,
    signed: true,
  })

  try {
    res.set('$session', '')
  } catch (err) {}
}

export async function setAuthCookies(arg: {
  req: Request
  res: Response
  transaction: Transaction
  userInstance?: User | null
  session?: string | null
}) {
  const { req, res, transaction, userInstance, session } = arg

  if (res.headersSent) {
    return
  }

  const cookies = req.signedCookies || {}

  const { userId } = cookies

  const getSession = session || cookies.session

  const isUserInstance = () => userInstance instanceof User

  if (userInstance === null && session === null) {
    clearAuthCookies(res)
  } else if ((userId || isUserInstance()) && getSession) {
    const expires = new Date(Date.now() + oneHour)

    const user = isUserInstance()
      ? (userInstance as User)
      : await User.findByPk(userId as string, {
          transaction,
        })

    if (user) {
      // sign user session
      await user.update({
        session: {
          ...user.session,
          [getSession]: {
            expires: expires.getTime(),
            userAgent: req.headers['user-agent'] || 'null',
          },
        },
      })

      await user.save({ transaction })

      await user.reload({ transaction })

      res.cookie('session', getSession, {
        httpOnly: true,
        expires,
        secure: true,
        signed: true,
      })

      res.cookie('userId', user.id, {
        httpOnly: true,
        expires,
        secure: true,
        signed: true,
      })

      try {
        res.set(
          '$user',
          JSON.stringify(
            removeSensitiveFields({
              ...user.get(),
            })
          )
        )
      } catch (err) {}
    } else clearAuthCookies(res)
  } else clearAuthCookies(res)
}
