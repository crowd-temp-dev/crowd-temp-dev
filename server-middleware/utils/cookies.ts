// eslint-disable-next-line import/named
import { Response, Request } from 'express'
import { oneHour } from '../../utils'
import DB from '../../database'
import { User } from '../../database/models/User/User'
import { getIp, removeSensitiveFields } from '.'

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

export async function setAuthCookies(
  req: Request,
  res: Response,
  userInstance?: User | null,
  _session?: string | null
) {
  if (res.headersSent) {
    return
  }

  const cookies = req.signedCookies || {}

  const { userId } = cookies

  const session = _session || cookies.session

  const isUserInstance = () => userInstance instanceof User

  if (userInstance === null && _session === null) {
    clearAuthCookies(res)
  } else if ((userId || isUserInstance()) && session) {
    const expires = new Date(Date.now() + oneHour)

    const transaction = await DB.transaction()

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
          [session]: {
            expires: expires.getTime(),
            ip: getIp(req),
            userAgent: req.headers['user-agent'] || 'null',
          },
        },
      })

      await user.save({ transaction })

      await user.reload({ transaction })

      res.cookie('session', session, {
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

    await transaction.commit()
  } else clearAuthCookies(res)
}
