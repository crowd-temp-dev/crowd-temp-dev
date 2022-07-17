import { Request, Response } from 'express'
import { User } from '../../../../../../database/models/User/User'
import DB from '../../../../../../database'
import mailer from '../../../../../email'
import { loginUser } from '../../../utils'
import { getGoogleUserData } from '.'

export default async function googleSignUp(req: Request, res: Response) {
  const transaction = await DB.transaction()

  try {
    const googleUserData = await getGoogleUserData(req.query.code as string)

    console.log({ googleUserData })

    if (!googleUserData.verified_email) {
      throw new Error('{Google account not verified!} {/auth/sign-up}')
    }

    const focusOnLoginBtn = () => res.cookie('login_focus', 'google')

    // find user
    const findUser = await User.findOne({
      where: {
        email: googleUserData.email,
      },
      transaction,
    })

    if (findUser) {
      await transaction.rollback()

      focusOnLoginBtn()

      throw new Error('{Account exist!} {/auth/login}')
    } else {
      const newUser = await User.create(
        {
          email: googleUserData.email,
          confirmed: true,
          confirmedAt: Date.now(),
          firstName: googleUserData.given_name,
          lastName: googleUserData.family_name,
          password: '',
          provider: 'google',
          role: 'tester',
          avatar: googleUserData.picture,
        },
        { transaction }
      )

      mailer.sendMail({
        from: 'UnbugQA',
        to: newUser.email,
        subject: 'Welcome to Crowd',
        html: `<div>
                <p>
                  Hi ${newUser.firstName}! Welcome to Crowd!
                </p>
                <p>
                  <em>
                    Account created with Google
                  </em>
                </p>
              </div>`,
      })

      focusOnLoginBtn()

      // res.cookie('login_success_message', 'Account created!')

      res.cookie('remember', 1)

      await transaction.commit()

      const loginTransaction = await DB.transaction()

      await loginUser({
        req,
        res,
        user: newUser,
        transaction: loginTransaction,
      })

      await loginTransaction.commit()      

      res.redirect(302, `${process.env.CLIENT_ORIGIN}/auth/account-confirmed`)
    }
  } catch (err) {
    // await transaction.rollback()

    const [message, redirectTo] = (err.message as string)
      .split(/\}\s/)
      .map((x) => x.replace(/\{|\}/g, ''))

    res.cookie('signup_error_message', message || '')

    res.redirect(302, `${process.env.CLIENT_ORIGIN}${redirectTo}`)

    res.end()
  }
}
