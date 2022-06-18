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

export class CustomMessage extends Model<
  InferAttributes<CustomMessage>,
  InferCreationAttributes<CustomMessage>
> {
  declare id: CreationOptional<string>
  declare createdBy: string
  declare testId: string
  declare index: number
  declare message: string
}

export default function initCustomMessage(DB: Sequelize) {
  CustomMessage.init(
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
      index: {
        type: DataTypes.REAL(),
        allowNull: false,
        validate: {
          min: 0,
          max: 49,
        },
      },
      createdBy: {
        ...Uuidv4,
        allowNull: false,
      },
      message: {
        type: DataTypes.STRING(),
        allowNull: false,
      },
    },
    {
      sequelize: DB,
      timestamps: true,
    }
  )

  return CustomMessage
}
