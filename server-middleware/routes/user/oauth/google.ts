import axios from 'axios'
import { Router } from 'express'
import { User } from '../../../../database/models/User/User'
import DB from '../../../../database'
import { routeQuery } from '../../../utils'
import {
  sendFormattedError,
  sendSuccess,
} from '../../../utils/sendRes'

interface GoogleTokenResponse {
  access_token: string
  expires_in: number
  refresh_token: string
  scope: string
  token_type: string
  id_token: string
}

interface GoogleUserData {
  iss: string
  azp: string
  aud: string
  sub: string
  email: string
  email_verified: boolean
  at_hash: string
  name: string
  picture: string
  given_name: string
  family_name: string
  locale: string
  iat: number
  exp: number
}

export default function (router: Router) {
  return router.get('/auth/oauth/google', async (req, res) => {
    /**
     * - get 'code' from query
     *
     * - get id and access_token with the code
     *
     * - get user with tokens
     *
     * - upsert the user
     *
     * - create a session
     *
     * - create access and refresh tokens
     *
     * - set cookies
     *
     * - redirect back to client
     * **/

    try {
      const { code } = req.query

      const getOAuthTokens = async () => {
        try {
          const url = 'https://oauth2.googleapis.com/token'

          const values = {
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URL,
            grant_type: 'authorization_code',
          }

          const res = await axios.post<GoogleTokenResponse>(
            `${url}?${routeQuery(values)}`,
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            }
          )

          return res.data
        } catch (err) {
          throw new Error('{500} Error fetching Google tokens')
        }
      }

      const tokens = await getOAuthTokens()

      const getUserData = async () => {
        try {
          const res = await axios.get<GoogleUserData>(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`,
            {
              headers: {
                Authorization: `Bearer ${tokens.id_token}`,
              },
            }
          )

          return res.data
        } catch (err) {
          throw new Error('Error fetching Google user')
        }
      }

      const googleUserData = await getUserData()

      // find user
      const transaction = await DB.transaction()

      const user = await User.findOne({
        where: {
          email: googleUserData.email,
        },
        transaction,
      })

      if (!user) {
        const error = {
          status: 401,
          message: "Account doesn't exist!",
        }

        res.cookie('signup_error_message', error.message)

        res.cookie('signup_focus', 'google')

        res.redirect(302, `${process.env.CLIENT_ORIGIN}/auth/sign-up`)

        res.sendStatus(401)

        throw new Error(`{${error.status}} ${error.message}`)
      } else {
        res.redirect(302, `${process.env.CLIENT_ORIGIN}/auth/login`)

        if (!googleUserData.email_verified) {
          throw new Error('{403} Google account not verified!')
        }

        sendSuccess(res, {
          data: googleUserData,
        })
      }
    } catch (err) {
      sendFormattedError(err, res)
    }
  })
}
