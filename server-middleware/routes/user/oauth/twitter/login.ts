// import { OAuth2 } from 'oauth'
import { Router } from 'express'

export default function (router: Router) {
  return router.get('/auth/oauth/twitter', () => {
    // const path = req.cookies.auth_provider_path as 'login' | 'sign-up'

    // res.cookie('auth_provider_path', '', {
    //   maxAge: 1,
    // })

    // const oauth2 = new OAuth2(
    //   process.env.TWITTER_API_KEY,
    //   process.env.TWITTER_API_SECRET,
    //   'https://api.twitter.com/',
    //   null,
    //   'oauth2/token',
    //   null
    // )

    // const getOAuthAccessToken = await oauth2.getOAuthAccessToken('', {
    //   grant_type: 'client_credentials',
    // })
  })
}
