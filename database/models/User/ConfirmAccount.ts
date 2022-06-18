import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  DataTypes,
  Sequelize,
  CreationOptional,
} from 'sequelize'
import { Uuidv4 } from '../../utils/model'
import { inOneDay } from '../../../utils'

export class ConfirmAccount extends Model<
  InferAttributes<ConfirmAccount>,
  InferCreationAttributes<ConfirmAccount>
> {
  declare id?: string
  declare userId: string
  declare expires: CreationOptional<number>
}

export default function initUser(dbInstance: Sequelize) {
  ConfirmAccount.init(
    {
      id: {
        ...Uuidv4,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        unique: true,
      },

      userId: {
        ...Uuidv4,
        unique: true
      },

      expires: {
        type: DataTypes.REAL(),
        defaultValue: inOneDay
      }
    },
    {
      sequelize: dbInstance,
      timestamps: true,
    }
  )

  return ConfirmAccount
}
