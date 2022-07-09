import { Request, Response } from 'express'
import { User } from '../../../../../../database/models/User/User'
import DB from '../../../../../../database'
import mailer from '../../../../../email'
import { getGoogleUserData } from '.'

export default async function googleSignUp(req: Request, res: Response) {
  try {
    const googleUserData = await getGoogleUserData(req.query.code as string)

    console.log({ googleUserData })

    if (!googleUserData.verified_email) {
      throw new Error('{Google account not verified!} {/auth/sign-up}')
    }

    const focusOnLoginBtn = () => res.cookie('login_focus', 'google')

    // find user
    const transaction = await DB.transaction()

    const findUser = await User.findOne({
      where: {
        email: googleUserData.email,
      },
      transaction,
    })

    if (findUser) {
      await transaction.rollback()

      focusOnLoginBtn()

      throw new Error('{Account exist!} {/auth/sign-up}')
    } else {
      const newUser = await User.create(
        {
          email: googleUserData.email,
          confirmed: true,
          confirmedAt: Date.now(),
          name: googleUserData.name,
          password: '',
          provider: 'google',
          role: 'tester',
        },
        { transaction }
      )

      await transaction.commit()

      mailer.sendMail({
        from: 'UnbugQA',
        to: newUser.email,
        subject: 'Welcome to Crowd',
        html: `<div>
                      <p>
                        Hi ${newUser.name}! Welcome to Crowd!
                      </p>
                      <p>
                        <em>
                          Account created with Google
                        </em>
                      </p>
                    </div>`,
      })

      focusOnLoginBtn()

      res.cookie('login_success_message', 'Account created!')

      res.redirect(302, `${process.env.CLIENT_ORIGIN}/auth/login`)
    }
  } catch (err) {
    const [message, redirectTo] = (err.message as string)
      .split(/\}\s/)
      .map((x) => x.replace(/\{|\}/g, ''))

    res.cookie('signup_error_message', message || '')

    res.redirect(302, `${process.env.CLIENT_ORIGIN}${redirectTo}`)

    res.end()
  }
}