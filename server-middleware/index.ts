import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'

import cors from 'cors'
import morgan from 'morgan'
import { startDB } from '../database'
import routes from './routes'
import { catchAllRoute } from './utils'

const app = express()
console.log(process.env);

startDB()
  .then(() => {
    console.log({SAA:300});
    
    app.use([
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
