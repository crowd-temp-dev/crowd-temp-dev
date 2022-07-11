import { Request, Response } from 'express'
import { User } from '../../../../../../database/models/User/User'
import DB from '../../../../../../database'
import { loginUser } from '../../../utils'
import { getGoogleUserData } from '.'

export default async function googleLogin(req: Request, res: Response) {
  try {
    const googleUserData = await getGoogleUserData(req.query.code as string)

    // find user
    const transaction = await DB.transaction()

    const user = await User.findOne({
      where: {
        email: googleUserData.email,
      },
      transaction,
    })

    if (!user) {
      await transaction.rollback()

      res.cookie('signup_focus', 'google')

      throw new Error("{Account doesn't exist!} {/auth/sign-up}")
    } else if (user.provider !== 'google') {
      throw new Error('{Invalid provider!} {/auth/sign-up}')
    } else if (!googleUserData.verified_email) {
      throw new Error('{Google account not verified!} {/auth/sign-up}')
    } else {
      res.cookie('signup_error_message', '', { maxAge: 1 })

      await loginUser({
        user,
        req,
        res,
      })

      await user.save({ transaction })

      res.cookie('remember', '1')

      res.cookie(
        'login_provider_alert',
        user.loginCount < 2
          ? `Hi ${user.name}! Welcome to Crowd!`
          : `Welcome back ${user.name}!`
      )

      res.redirect(302, `${process.env.CLIENT_ORIGIN}`)
    }
  } catch (err) {
    const [message, redirectTo] = (err.message as string)
      .split(/\}\s/)
      .map((x) => x.replace(/\{|\}/g, ''))

    res.cookie('login_error_message', message || '')

    res.redirect(302, `${process.env.CLIENT_ORIGIN}${redirectTo}`)

    res.end()
  }
}
