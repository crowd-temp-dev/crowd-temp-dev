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
  declare ip: CreationOptional<string | null>
  declare userAgent: CreationOptional<string | null>
  declare currentIndex: Record<
    string,
    `${number}${string}` | `confirm-${number}${string}` | 'done'
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
      ip: {
        type: DataTypes.STRING(),
        allowNull: true,
        validate: {
          isIP: {
            msg: 'Invalid IP',
          },
        },
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
