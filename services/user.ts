import { validateStatus } from './utils'
import { ServiceHandler } from './type'
import { LoginForm } from '~/server-middleware/routes/user/login'
import { SignUpForm } from '~/server-middleware/routes/user/signup/signup'
import { ForgotPasswordForm } from '~/server-middleware/routes/user/forgot-password'
import { ResetPasswordForm } from '~/server-middleware/routes/user/reset-password'
import { UserData } from '~/server-middleware/types'
import { User } from '~/database/models/User/User'
import { DeleteAccountForm } from '~/server-middleware/routes/user/delete-account'
import { ChangePasswordForm } from '~/server-middleware/routes/user/change-password'
import { OnboardForm } from '~/server-middleware/routes/user/onboard'

// PascalCased function names!
export const Signup: ServiceHandler<SignUpForm, User> = async (
  axios,
  payload
) => {
  return await axios.$post('/auth/signup', payload, validateStatus)
}

export const ConfirmAccount: ServiceHandler<{ token: string }, User> = async (
  axios,
  payload
) => {
  return await axios.$post('/auth/confirmAccount', payload, validateStatus)
}

export const Login: ServiceHandler<LoginForm, User> = async (
  axios,
  payload
) => {
  return await axios.$post('/auth/login', payload, validateStatus)
}

export const ReloadUser: ServiceHandler<boolean, User> = async (
  axios,
  progress = false
) => {
  return await axios.$get('auth/reload', {
    ...validateStatus,
    progress,
  })
}

export const Logout: ServiceHandler<null, []> = async (axios) => {
  return await axios.$post('/auth/logout', {}, validateStatus)
}

export const LogoutAllSessions: ServiceHandler<
  {
    token: string
    id: string
  },
  []
> = async (axios, payload) => {
  return await axios.$post(
    '/auth/logout',
    {
      ...payload,
      endAllSession: true,
    },
    validateStatus
  )
}

export const ForgotPassword: ServiceHandler<ForgotPasswordForm, {}> = async (
  axios,
  payload
) => {
  return await axios.$post('/auth/forgotPassword', payload, validateStatus)
}

export const ResetPasswordPage: ServiceHandler<{ token: string }, any> = async (
  axios,
  payload
) => {
  return await axios.$get(
    `/auth/resetPassword?token=${payload.token}`,
    validateStatus
  )
}

export const ResetPassword: ServiceHandler<ResetPasswordForm, {}> = async (
  axios,
  payload
) => {
  return await axios.$post('/auth/resetPassword', payload, validateStatus)
}

export const UpdateUser: ServiceHandler<UserData, User> = async (
  axios,
  payload
) => {
  return await axios.$patch('/auth/update', payload, validateStatus)
}

export const CancelEmailChange: ServiceHandler<
  { token: string; id: string },
  User
> = async (axios, payload) => {
  return await axios.$post('/auth/cancelEmailChange', payload, validateStatus)
}

export const ChangeEmail: ServiceHandler<
  { token: string; id: string },
  User
> = async (axios, payload) => {
  return await axios.$post('/auth/changeEmail', payload, validateStatus)
}

export const ChangePassword: ServiceHandler<ChangePasswordForm, User> = async (
  axios,
  payload
) => {
  return await axios.$patch('/auth/changePassword', payload, validateStatus)
}

export const DeleteAccount: ServiceHandler<DeleteAccountForm, []> = async (
  axios,
  data
) => {
  return await axios.$delete('/auth/user', {
    data,
    validateStatus: () => true,
  })
}

export const SendDeleteEmailConfirmation: ServiceHandler<null, []> = async (
  axios
) => {
  return await axios.$post('/auth/deleteUser/confirm', null, validateStatus)
}

export const RemoveAvatar: ServiceHandler<null, []> = async (axios) => {
  return await axios.$patch('/auth/update/removeAvatar', null, validateStatus)
}

export const UpdateAvatar: ServiceHandler<Record<string, any>, User> = async (
  axios,
  payload
) => {
  return await axios.$patch('/auth/update/avatar', payload, validateStatus)
}

export const ResendVerificationEmail: ServiceHandler<
  string,
  {
    id: string
    email: string
  }
> = async (axios, id) => {
  return await axios.$post(
    '/auth/resendVerificationEmail',
    { id },
    validateStatus
  )
}

export const SetupAccount: ServiceHandler<OnboardForm, User> = async (
  axios,
  payload
) => {
  return await axios.$post('/user/setup-account', payload, validateStatus)
}
