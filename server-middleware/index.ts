import express from 'express'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import fileUpload from 'express-fileupload'
import cors from 'cors'
import morgan from 'morgan'
import MemCache from 'connect-memcached'
import { startDB } from '../database'
import { uuidv4 } from '../utils'
import routes from './routes'
import { catchAllRoute } from './utils'

const app = express()

startDB()
  .then(() => {
    app.set('trust proxy', true)

    const MemCachedStore = MemCache(session)

    app.use([
      cookieParser(process.env.COOKIE_SECRET),
      bodyParser.json(),
      cors({
        credentials: true,
        origin: ['*'],
      }),
      morgan('combined'),
      session({
        secret: process.env.COOKIE_SECRET,
        proxy: true,
        resave: false,
        saveUninitialized: false,
        store: new MemCachedStore({
          hosts: [process.env.CLIENT_ORIGIN],
          secret: process.env.COOKIE_SECRET,
        }),
        genid: (_) => uuidv4(),
        cookie: {
          httpOnly: true,
          signed: true,
        },
      }),
      fileUpload({
        tempFileDir: '/tmp/',
        useTempFiles: true,
      }),
      routes,
    ])
  })
  .catch(() => {
    catchAllRoute(app, 'Error starting database!')
  })

module.exports = app
