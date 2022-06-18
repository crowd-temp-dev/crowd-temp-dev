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
import { fiveSecondsTestDurations } from '../../../utils'
import { FiveSecondsTestDurations } from '~/types'

export class FiveSecondsTest extends Model<
  InferAttributes<FiveSecondsTest>,
  InferCreationAttributes<FiveSecondsTest>
> {
  declare id: CreationOptional<string>
  declare testId: string
  declare createdBy: string
  declare index: number
  declare questionIds: string[]
  declare duration: FiveSecondsTestDurations
  declare fileURL: string
}

export default function initFiveSecondsTest(DB: Sequelize) {
  FiveSecondsTest.init(
    {
      id: {
        ...Uuidv4,
        defaultValue: uuidv4,
        primaryKey: true,
        unique: true,
      },
      testId: {
        ...Uuidv4,
        allowNull: false,
      },
      createdBy: {
        ...Uuidv4,
        allowNull: false,
      },
      index: {
        type: DataTypes.REAL(),
        allowNull: false,
        validate: {
          min: 0,
          max: 49,
        },
      },
      questionIds: {
        type: DataTypes.ARRAY(DataTypes.UUID()),
        allowNull: false,
      },
      duration: {
        type: DataTypes.REAL(),
        allowNull: false,
        validate: {
          is: {
            args: new RegExp(`^(?:${fiveSecondsTestDurations.join('|')})$`),
            msg: 'Invalid duration',
          },
        },
      },
      fileURL: {
        ...Uuidv4,
        allowNull: false,
      },
    },
    {
      sequelize: DB,
      timestamps: true,
    }
  )

  return FiveSecondsTest
}
