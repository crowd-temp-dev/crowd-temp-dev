import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  DataTypes,
  Sequelize,
  CreationOptional,
} from 'sequelize'
import { Uuidv4 } from '../../utils/model'

export class ForgotPassword extends Model<
  InferAttributes<ForgotPassword>,
  InferCreationAttributes<ForgotPassword>
> {
  declare id?: string
  declare userId: string
  declare expires: CreationOptional<number>
  declare tryAgainIn: CreationOptional<number>
}

export default function initUser(dbInstance: Sequelize) {
  ForgotPassword.init(
    {
      id: {
        ...Uuidv4,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        unique: true,
      },

      userId: {
        ...Uuidv4,
        unique: true,
      },

      expires: {
        type: DataTypes.REAL(),
        allowNull: false
      },

      tryAgainIn: {
        type: DataTypes.REAL(),
        allowNull: false
      }
    },
    {
      sequelize: dbInstance,
      timestamps: false,
    }
  )

  return ForgotPassword
}
