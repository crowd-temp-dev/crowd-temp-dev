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

export class WelcomeScreen extends Model<
  InferAttributes<WelcomeScreen>,
  InferCreationAttributes<WelcomeScreen>
> {
  declare id: CreationOptional<string>
  declare testId: string
  declare title: string
  declare message: string
  declare buttonText: string
}

export default function initWelcomeScreen(DB: Sequelize) {
  WelcomeScreen.init(
    {
      id: {
        ...Uuidv4,
        defaultValue: uuidv4,
        primaryKey: true,
        unique: true,
      },
      testId: {
        ...Uuidv4,
        allowNull: false
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      message: {
        type: DataTypes.STRING(),
        allowNull: false,
      },
      buttonText: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
    },
    {
      sequelize: DB,
      timestamps: true,
    }
  )

  return WelcomeScreen
}
