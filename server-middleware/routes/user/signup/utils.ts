import mailer from '../../../email'
import { routeQuery } from '../../../utils'
import type { User } from '~/database/models/User/User'

export async function sendVerificationEmail(user: User, token: string) {
  return await mailer.sendMail({
    from: 'UnbugQA',
    to: user.email,
    subject: 'Confirm your Crowd Testing account',
    html: `<div>
                      <p>
                        Hi ${
                          user.firstName
                        }! Please click the link below to confirm your account.
                      </p>
                      <p>
                        <strong>
                          <a href="${
                            process.env.CLIENT_ORIGIN
                          }/auth/account-confirmed?${routeQuery({
      token,
    })}"
                          >
                            Confirm account
                          </a>
                        </strong>
                      </p>
                    </div>`,
  })
}
