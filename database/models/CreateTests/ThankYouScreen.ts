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

export class ThankYouScreen extends Model<
  InferAttributes<ThankYouScreen>,
  InferCreationAttributes<ThankYouScreen>
> {
  declare id: CreationOptional<string>
  declare testId: string
  declare title: string
  declare message: string
}

export default function initThankYouScreen(DB: Sequelize) {
  ThankYouScreen.init(
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
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      message: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      sequelize: DB,
      timestamps: true,
    }
  )

  return ThankYouScreen
}
