import { routeQuery } from '~/server-middleware/utils'

export function googleOAuthUrl(env: Record<string, string>) {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth'
  const scope = (type: 'profile' | 'email') =>
    `https://www.googleapis.com/auth/userinfo.${type}`

  const options = {
    redirect_uri: env.GOOGLE_OAUTH_REDIRECT_URL,
    client_id: env.GOOGLE_CLIENT_ID,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: `${scope('profile')} ${scope('email')}`,
  }

  return `${rootUrl}?${routeQuery(options)}`
}
