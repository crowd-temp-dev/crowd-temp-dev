import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  DataTypes,
  CreationOptional,
  Sequelize,
} from 'sequelize'
import { userRoleRegExpString } from '../../utils'
import { UserAction, UserSession } from '../../type'
import { Uuidv4 } from '../../utils/model'
import type { UserRole } from '~/types'

// eslint-disable-next-line no-use-before-define
export class Recover extends Model<
  InferAttributes<Recover>,
  InferCreationAttributes<Recover>
> {
  declare id: CreationOptional<string>
  declare email: string
  declare name: string
  declare password: string
  declare role: UserRole
  declare session: UserSession
  declare action: CreationOptional<UserAction>
  declare newsUpdate: boolean
  declare showDashboardGuide?: boolean
  declare confirmed?: boolean
  declare confirmedAt?: number
}

export default function initUser(dbInstance: Sequelize) {
  Recover.init(
    {
      id: {
        ...Uuidv4,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        unique: true,
      },

      email: {
        type: DataTypes.STRING(),
        allowNull: false,
        unique: true,
      },

      name: {
        type: DataTypes.STRING(255),
        unique: true,
        allowNull: false,
      },

      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      role: {
        type: DataTypes.STRING(6),
        allowNull: false,
        validate: {
          is: new RegExp(userRoleRegExpString),
        },
      },

      session: {
        type: DataTypes.JSON(),
        allowNull: false,
        defaultValue: () => ({}),
      },

      newsUpdate: {
        type: DataTypes.BOOLEAN(),
        defaultValue: false,
      },

      showDashboardGuide: {
        type: DataTypes.BOOLEAN(),
        defaultValue: true,
      },

      confirmed: {
        type: DataTypes.BOOLEAN(),
        defaultValue: false,
      },

      confirmedAt: {
        type: DataTypes.REAL(),
      },

      action: {
        type: DataTypes.JSON(),
        allowNull: false,
        defaultValue: () => ({}),
      },
    },
    {
      sequelize: dbInstance,
      timestamps: true,
    }
  )

  return Recover
}
