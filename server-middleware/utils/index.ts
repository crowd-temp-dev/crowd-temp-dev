import path from 'path'
import fs from 'fs'
// eslint-disable-next-line import/named
import { Express, Request } from 'express'
import { ActionQuery, MessageObject } from '../types'
import { sendError } from './sendRes'
import { User } from '~/database/models/User/User'
/**
 * @name catchAllRoute
 * @description
 * Throws 404 error for non registered routes
 * @param {Express} router
 * **/
export const catchAllRoute = (
  router: Express,
  message: string = 'Invalid endpoint!'
) => {
  // handle 404 routes
  router.all('*', (_, res) =>
    sendError(res, {
      status: 404,
      message: {
        type: 'error',
        content: message,
      },
    })
  )
}
export const formatEnvNumber = (arg?: string) =>
  Number(arg?.replace(/,/g, '')) || 0

export const loggedInMessage = (user: User) => {
  if (!user) {
    return {} as MessageObject
  }

  return {
    content: `Welcome back ${user.name}!`,
    type: 'success',
  } as MessageObject
}

export const getModules = (arg: {
  directory: string | string[]
  exempt?: string[]
}) => {
  const { directory, exempt = [] } = arg

  const output: any[] = []

  const dirPath = path.join(...[directory].flat())

  fs.readdirSync(dirPath)
    .filter(
      (file) =>
        !exempt.find((exemptedFile) =>
          new RegExp(`${exemptedFile}\\.(?:js|ts)`).test(file)
        )
    )
    .forEach((file) => {
      if (!/\..+$/.test(file)) {
        output.push(...getModules({ directory: path.join(dirPath, file) }))
      } else {
        output.push(require(path.join(dirPath, file)))
      }
    })

  return output
}

/**
 * @name removeSensitiveFields
 * @description
 * Removes sensitive fields from api responses
 * @param {Record<string, any>} data
 * @returns {Record<string, any>}
 * **/
export function removeSensitiveFields(
  data: Record<string, any>
): Record<string, any> {
  const rawData = { ...data }

  const sensitiveFields = ['password']

  // remove user data that aren't required
  if (
    rawData.id &&
    rawData.email &&
    typeof rawData.showDashboardGuide === 'boolean'
  ) {
    sensitiveFields.push(
      'action',
      'session',
      'confirmed',
      'confirmedAt',
      'updatedAt',
      'createdAt'
    )
  }

  sensitiveFields.forEach((field) => {
    delete rawData[field]
  })

  // remove session object, only session strings are allowed to be sent.
  if (typeof rawData.session === 'object') {
    delete rawData.session
  }

  return rawData
}

export const apiActionQuery = (query: ActionQuery) =>
  new URLSearchParams({
    ...query,
  }).toString()

export const getIp = (req: Request) =>
  req.ip ||
  ((req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress ||
    req.session.id) as string)

export const isAnswering = (req: Request) => req.path.startsWith('/answer-test')
