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
import { CreateTestTypes } from '~/types'

interface Answer {
  type: CreateTestTypes
  questions: Record<string, any[]>
}

export class TestAnswer extends Model<
  InferAttributes<TestAnswer>,
  InferCreationAttributes<TestAnswer>
> {
  declare id: CreationOptional<string>
  declare userId: string
  declare username: string
  declare testId: string
  declare answers: CreationOptional<Record<`${number}`, Answer>>
  declare done: CreationOptional<boolean>
}

export default function initPrototypeEvaluation(DB: Sequelize) {
  TestAnswer.init(
    {
      id: {
        ...Uuidv4,
        defaultValue: uuidv4,
        primaryKey: true,
        unique: true,
      },
      userId: {
        ...Uuidv4,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
          is: /^(?:[a-zA-Z]).{1,254}$/,
        },
      },
      testId: {
        ...Uuidv4,
        allowNull: false,
      },
      answers: {
        type: DataTypes.JSON(),
        defaultValue: () => ({}),
        allowNull: false,
      },
      done: {
        type: DataTypes.BOOLEAN(),
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize: DB,
      timestamps: true,
    }
  )

  return TestAnswer
}
