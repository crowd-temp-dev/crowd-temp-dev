import { Request, Response } from 'express'
import { Transaction } from 'sequelize/types'
import { getFullTest } from '../../../database/models/Project/utils'

export default async function getFullTestFromSession(arg: {
  res: Response
  req: Request
  testId: string
  transaction: Transaction
  includeId?: boolean
}) {
  const { testId, transaction, includeId } = arg

  const output = await getFullTest(testId, transaction, includeId)

  return output
}
