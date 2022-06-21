import express from 'express'
import { startDB } from '../database'
import { getFileHandler } from './routes/fileManager/utils'
import { catchAllRoute } from './utils'

const app = express()

startDB()
  .then(() => {
    app.get('/file/:id', getFileHandler())
  })
  .catch(() => {
    catchAllRoute(app, 'Error starting database!')
  })

module.exports = app
