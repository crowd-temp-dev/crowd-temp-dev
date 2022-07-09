import { createTransport } from 'nodemailer'

const {
  EMAIL_SERVICE,
  EMAIL_AUTH_TYPE,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REFRESH_TOKEN,
  EMAIL_ADDRESS,
  EMAIL_PASSWORD,
} = process.env

const mailer = createTransport({
  // @ts-ignore
  service: EMAIL_SERVICE,
  auth: {
    type: EMAIL_AUTH_TYPE,
    user: EMAIL_ADDRESS,
    pass: EMAIL_PASSWORD,
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    refreshToken: GOOGLE_REFRESH_TOKEN,
  },
})

export default mailer
