import { v4 as uuidv4 } from 'uuid'

import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
  Sequelize,
} from 'sequelize'
import { Uuidv4 } from '../../utils/model'

export class AnswerTestUser extends Model<
  InferAttributes<AnswerTestUser>,
  InferCreationAttributes<AnswerTestUser>
> {
  declare id: CreationOptional<string>
  declare testId: string
  declare userAgent: CreationOptional<string | null>
  declare currentIndex: Record<
    string,
    | `${number}${string}`
    | `confirm-${number}${string}`
    | `${number}${string}-instruction`
    | 'done'
  >
}

export default function initPrototypeEvaluation(DB: Sequelize) {
  AnswerTestUser.init(
    {
      id: {
        ...Uuidv4,
        defaultValue: uuidv4,
        primaryKey: true,
        unique: true,
      },
      // also session
      testId: {
        ...Uuidv4,
        allowNull: false,
      },
      userAgent: {
        type: DataTypes.STRING(),
        allowNull: true,
      },
      currentIndex: {
        type: DataTypes.JSON(),
        allowNull: false,
      },
    },
    {
      sequelize: DB,
      timestamps: true,
    }
  )

  return AnswerTestUser
}
