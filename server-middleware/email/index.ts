import nodemailer from 'nodemailer'

const {
  EMAIL_SERVICE,
  EMAIL_AUTH_TYPE,
  EMAIL_CLIENT_ID,
  EMAIL_CLIENT_SECRET,
  EMAIL_REFRESH_TOKEN,
  EMAIL_ADDRESS,
  EMAIL_PASSWORD,
} = process.env

const mailer = nodemailer.createTransport({
  // @ts-ignore
  service: EMAIL_SERVICE,
  auth: {
    type: EMAIL_AUTH_TYPE,
    user: EMAIL_ADDRESS,
    pass: EMAIL_PASSWORD,
    clientId: EMAIL_CLIENT_ID,
    clientSecret: EMAIL_CLIENT_SECRET,
    refreshToken: EMAIL_REFRESH_TOKEN,
  },
})

export default mailer
