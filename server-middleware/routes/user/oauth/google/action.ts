import { Router } from 'express'
import googleLogin from './utils/login'
import googleSignUp from './utils/signup'

export default function (router: Router) {
  return router.get('/auth/oauth/google', async (req, res) => {
    const path = req.cookies.auth_provider_path as 'login' | 'sign-up'

    res.cookie('auth_provider_path', '', {
      maxAge: 1,
    })

    if (path === 'login') {
      await googleLogin(req, res)
    } else {
      await googleSignUp(req, res)      
    }
  })
}
