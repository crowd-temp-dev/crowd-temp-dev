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
  message: string = 'Invalid endpoint!',
  matcher: string = '*'
) => {
  router.all(matcher, (_, res) =>
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
    content: `Welcome back ${user.firstName}!`,
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
          new RegExp(`${exemptedFile}$`).test(file)
        )
    )
    .forEach((file) => {
      if (!/\..+$/.test(file)) {
        output.push(
          ...getModules({ directory: path.join(dirPath, file), exempt })
        )
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

export const routeQuery = (query: Record<string, any>) =>
  new URLSearchParams({
    ...query,
  }).toString()

export const apiActionQuery = (query: ActionQuery) => routeQuery(query)

export const isAnswering = (req: Request) => req.path.startsWith('/answer-test')
