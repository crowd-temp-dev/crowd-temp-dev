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
import { FiveSecondTestDurations } from '~/types'

export class FiveSecondTest extends Model<
  InferAttributes<FiveSecondTest>,
  InferCreationAttributes<FiveSecondTest>
> {
  declare id: CreationOptional<string>
  declare testId: string
  declare createdBy: string
  declare index: number
  declare duration: FiveSecondTestDurations
  declare fileURL: string
}

export default function initFiveSecondTest(DB: Sequelize) {
  FiveSecondTest.init(
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
      duration: {
        type: DataTypes.REAL(),
        allowNull: false
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

  return FiveSecondTest
}
