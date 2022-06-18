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

export class PreferenceTest extends Model<
  InferAttributes<PreferenceTest>,
  InferCreationAttributes<PreferenceTest>
> {
  declare id: CreationOptional<string>
  declare testId: string
  declare createdBy: string
  declare index: number
  declare questionIds: string[]
  declare fileURLs: string[]
}

export default function initFiveSecondsTest(DB: Sequelize) {
  PreferenceTest.init(
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
      fileURLs: {
        type: DataTypes.ARRAY(DataTypes.UUID()),
        allowNull: false,
        validate: {
          min: 2,
          max: 4,
        },
      },
    },
    {
      sequelize: DB,
      timestamps: true,
    }
  )

  return PreferenceTest
}
