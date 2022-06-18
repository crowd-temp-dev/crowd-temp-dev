import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'

import cors from 'cors'
import morgan from 'morgan'
import session from 'express-session'
import MemCache from 'connect-memcached'
import { startDB } from '../database'
import routes from './routes'
import { catchAllRoute } from './utils'
const app = express()

startDB()
  .then(() => {
    app.set('trust proxy', true)

    const MemCachedStore = MemCache(session)
    
    app.use([
      session({
        secret: 'CatOnKeyboard',
        proxy: true,
        resave: false,
        saveUninitialized: false,
        store: new MemCachedStore({
          hosts: [process.env.CLIENT_ORIGIN],
          secret: process.env.COOKIE_SECRET, // Optionally use transparent encryption for memcached session data
        }),
      }),
      cookieParser(process.env.COOKIE_SECRET),
      bodyParser.json(),
      cors({
        credentials: true,
        origin: ['*'],
      }),
      morgan('combined'),
      routes,
    ])
  })
  .catch(() => {
    catchAllRoute(app, 'Error starting server!')
  })

module.exports = app
