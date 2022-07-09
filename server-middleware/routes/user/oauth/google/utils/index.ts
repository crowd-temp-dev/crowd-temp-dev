import axios from 'axios'
import { routeQuery } from '../../../../../utils'
import { GoogleTokenResponse, GoogleUserData } from '../type'

export async function getOAuthTokens(code: string) {
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
    throw new Error('{Error fetching Google tokens} {/auth/sign-up}')
  }
}

export async function getUserData(arg: {
  accessToken: string
  idToken: string
}) {
  const { accessToken, idToken } = arg

  try {
    const res = await axios.get<GoogleUserData>(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`,
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    )

    return res.data
  } catch (err) {
    throw new Error('{Error fetching Google user} {/auth/sign-up}')
  }
}

export async function getGoogleUserData(code: string) {
  const token = await getOAuthTokens(code)

  return await getUserData({
    accessToken: token.access_token,
    idToken: token.id_token,
  })
}
