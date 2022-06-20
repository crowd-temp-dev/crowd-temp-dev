import { Router } from 'express'
import { getFileHandler } from './utils'

export default function (router: Router) {
  return router.get('/file/:id', ...getFileHandler())
}
