import { Router, Express } from 'express'
import { catchAllRoute, getModules } from '../utils'

const router = Router({ caseSensitive: true, strict: true })

getModules({directory: __dirname, exempt:['index', 'utils']})
  .forEach((file) => {
    const createRoute = file?.default

    if (typeof createRoute === 'function') {
      createRoute(router)
    }
  })

catchAllRoute(router as Express)

export default router
