import { RequestHandler } from 'express'
import { User } from '../../database/models/User/User'
import { TestDetail } from '../../database/models/CreateTests/TestDetail'
import DB from '../../database'
import { AnswerTestUser } from '../../database/models/AnswerTest/User'
import { oneDay } from '../../utils'
import { getFullTest } from '../../database/models/CreateTests/utils'
import { setAuthCookies } from './cookies'
import { sendError, sendFormattedError, sendSuccess } from './sendRes'

// check to see that the user exist with an active session. Sign session if true,
// clear cookies if false;
export const authenticate: RequestHandler = async function (req, res, next) {
  const { userId, session } = req.signedCookies

  const errorRes = (message = 'You must be logged in!') => {
    sendError(res, {
      status: 401,
      message: {
        content: message,
        type: 'error',
      },
    })
  }

  if (!session || !userId) {
    errorRes(
      !session
        ? 'Fixing log in error. Please use Google' + userId
          ? ` ${userId}`
          : ''
        : 'No user Id'
    )
  } else {
    await DB.transaction(async (transaction) => {
      // find user;
      const user = await User.findByPk(userId, { transaction })

      if (user) {
        // check if session is active;
        const currentSession = user.session[session]

        if (currentSession && currentSession.expires > Date.now()) {
          if (currentSession.userAgent !== req.headers['user-agent']) {
            errorRes('Session terminated!')
          } else {
            await setAuthCookies({
              req,
              res,
              transaction,
              userInstance: user,
              session,
            })

            next()
          }
        } else errorRes('Session expired!')
      } else {
        errorRes("Account doesn't exist!")
      }
    })
  }
}

/**
 * @name verifyAnsUser
 * @description
 * Verifies the following:
 *   - A test exists and is still recieving responses,
 *        - If test doesnt meet above, send error
 *   - ansUserId exists in the cookie, and it the same user.
 *        - if above criteria doesnt meet, create new user info and send back to start again.
 *   - return the ansUser
 * **/
export const verifyAnsUser: RequestHandler = async function (req, res, next) {
  // share link should exist in signed cookies, or in req.params
  const shareLink = req.params.shareLink || req.signedCookies.shareLink

  const sendErrorAndGoHome = (message: string, status: number) => {
    sendError(res, {
      message: {
        content: message,
        type: 'error',
      },
      trace: {
        sendTo: '/',
      },
      status,
    })
  }

  if (!shareLink) {
    sendErrorAndGoHome('Invalid test url!', 404)
  }

  res.cookie('shareLink', shareLink, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay * 2),
    secure: true,
    signed: true,
  })

  try {
    await DB.transaction(async (transaction) => {
      // find test
      const testDetails = await TestDetail.findOne({
        where: {
          shareLink,
        },
        transaction,
        attributes: ['id', 'stopAcceptingResponse'],
      })

      if (!testDetails) {
        sendErrorAndGoHome('Test not found!', 404)
      } else if (testDetails.stopAcceptingResponse) {
        sendErrorAndGoHome('Answering this test is disabled!', 403)
      } else {
        res.cookie('testId', testDetails.id, {
          httpOnly: true,
          expires: new Date(Date.now() + oneDay * 2),
          secure: true,
          signed: true,
        })

        // find user
        // user should exist in req.signedCookies
        const { ansUserId } = await req.signedCookies

        const userDetails = {
          userAgent: req.headers['user-agent'] || 'null',
        }

        const setUserIdCookie = (id: string) => {
          res.cookie('ansUserId', id, {
            httpOnly: true,
            expires: new Date(Date.now() + oneDay * 2),
            secure: true,
            signed: true,
          })
        }

        const fullTest = await getFullTest(testDetails.id, transaction, true)

        if (fullTest) {
          res.set('qIndexes', fullTest.indexes)
        }

        const createNewUserAndRestart = async (_user?: AnswerTestUser) => {
          let user: AnswerTestUser | null = null

          if (!_user) {
            user = await AnswerTestUser.create(
              {
                testId: testDetails.id,
                ...userDetails,
                currentIndex: {
                  [testDetails.id]: '0a',
                },
              },
              { transaction }
            )
          } else {
            await _user.update({
              currentIndex: {
                ..._user.currentIndex,
                [testDetails.id]: '0a',
              },
            })

            await _user.save({ transaction })

            user = await _user.reload({ transaction })
          }

          setUserIdCookie(user.id)

          sendSuccess(res, {
            data: {
              fullTest: fullTest?.data || {},
              sendTo: shareLink,
            },
          })
        }

        if (!ansUserId) {
          return await createNewUserAndRestart()
        } else {
          const user = await AnswerTestUser.findByPk(ansUserId, { transaction })

          // check that it's the same user
          const sameUser = user
            ? user.userAgent === userDetails.userAgent
            : false

          if (!user || !sameUser || !user.currentIndex[testDetails.id]) {
            return await createNewUserAndRestart(user as AnswerTestUser)
          }

          setUserIdCookie(user.id)

          next()
        }
      }
    })
  } catch (err) {
    sendFormattedError(err, res)
  }
}
