import { Request, Response } from 'express'
import { User } from '../../../../../../database/models/User/User'
import DB from '../../../../../../database'
import { loginUser } from '../../../utils'
import { getGoogleUserData } from '.'

export default async function googleLogin(req: Request, res: Response) {
  try {
    const googleUserData = await getGoogleUserData(req.query.code as string)

    const backToSignUp = (message: string) => {
      res.cookie('signup_error_message', message)

      res.redirect(302, `${process.env.CLIENT_ORIGIN}/auth/sign-up`)

      res.end()
    }

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

      backToSignUp("Account doesn't exist!")

      res.cookie('signup_focus', 'google')
    } else if (user.provider !== 'google') {
      backToSignUp('Invalid provider!')
    } else if (!googleUserData.verified_email) {
      backToSignUp('Google account not verified!')
    } else {
      res.cookie('signup_error_message', '', { maxAge: 1 })

      await loginUser({
        user,
        req,
        res,
      })

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
    res.redirect(302, `${process.env.CLIENT_ORIGIN}/auth/login`)

    res.end()
  }
}
