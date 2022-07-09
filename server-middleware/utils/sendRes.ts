import { Response } from 'express'
import type { MessageObject } from '../types'
import { isAnswering, removeSensitiveFields } from '.'

export type Message = MessageObject | MessageObject[]

/**
 * @name sendError
 * @description
 * Sends an error response with a message and an optional status that defaults to 500
 * @param {Response} res
 * @param {{status?: number; message: Message; trace: any}} payload
 * @returns {void}
 * **/
export function sendError(
  res: Response,
  payload: { status?: number; message: Message; trace?: any }
): void {
  const { message, status = 500, trace } = payload

  console.log({
    SENT: res.headersSent,
  })

  if (!res.headersSent) {
    res.set('$user', '')

    res.status(status)

    res.send({
      error: trace || {},
      status,
      message: [message].flat().filter(Boolean),
    })
  }

  res.end()
}

/**
 * @name sendSuccess
 * @description
 * Sends a success response with a message and an optional status that defaults to 200
 * @param {Response} res
 * @param {{status?: number; message?: Message; data: any}} payload
 * @returns {void}
 * **/
export function sendSuccess(
  res: Response,
  payload: { status?: number; data: any; message?: Message },
  removeSensitive: boolean = true
): void {
  const { data, status = 200, message } = payload

  if (!res.headersSent) {
    res.set('$user', '')

    res.status(status)

    res.send({
      data: removeSensitive ? removeSensitiveFields(data) : data,
      status,
      message: [message].flat().filter(Boolean),
    })
  }

  res.end()
}

export function sendDataOrError(
  res: Response,
  payload: { data?: any; error?: any; status?: number; message?: Message }
) {
  const { error, data, status, message } = payload

  if (error) {
    sendError(res, {
      message: {
        content: error?.message || 'Oops! An error occured.',
        type: 'error',
      },
      status: error?.status || status,
    })
  } else if (data) {
    sendSuccess(res, {
      status,
      data,
      message,
    })
  }
}

/**
 * @name sendFormattedError
 * @description
 * Formats error messages sent with the `Error` constructor. Known errors looks like `'{number}' string`.
 * @param { any|unknown } err
 * @param { Response } res
 * **/
export function sendFormattedError(
  err: any | unknown,
  res: Response,
  output: Record<string, any> = {}
) {
  if (err) {
    const matchStatus = err.message.match(/^\{\d+\}/g)

    // defined error
    if (matchStatus) {
      const status = Number(matchStatus[0].replace(/\{|\}/g, ''))

      return sendError(res, {
        message: {
          content: err.message.replace(/^\{\d+\}\s/, ''),
          type: 'error',
        },
        status,
        trace: output,
      })
    }

    // server error
    sendError(res, {
      message: {
        type: 'error',
        content: err.message || 'Server error! Ooops',
      },
      trace: isAnswering(res.req)
        ? {
            trace: err,
            ...output,
          }
        : err,
    })
  }
}
