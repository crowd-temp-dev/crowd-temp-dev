import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  DataTypes,
  Sequelize,
  CreationOptional,
} from 'sequelize'
import { Uuidv4 } from '../../utils/model'
import { oneDay } from '../../../utils'
import { getTokenValue } from '../../utils'

export class UserToken extends Model<
  InferAttributes<UserToken>,
  InferCreationAttributes<UserToken>
> {
  declare id?: string
  declare value: string
  declare userId: string
  declare duration: CreationOptional<number>
  declare type: 'confirm_account' | 'delete_account'
  declare wrongInput: number
  declare createdAt?: string
  declare expired?: boolean
}

export default function initUser(dbInstance: Sequelize) {
  UserToken.init(
    {
      id: {
        ...Uuidv4,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        unique: true,
      },

      value: {
        type: DataTypes.STRING(6),
        allowNull: false,
        defaultValue: getTokenValue
      },

      userId: {
        ...Uuidv4,
        unique: true,
      },

      duration: {
        type: DataTypes.REAL(),
        defaultValue: oneDay,
      },

      type: {
        type: DataTypes.STRING(),
        allowNull: false,
        validate: {
          is: /^(?:confirm_account|delete_account)$/,
        },
      },

      wrongInput: {
        type: DataTypes.REAL(),
        defaultValue: 0,
        allowNull: false,
      },
    },
    {
      sequelize: dbInstance,
      timestamps: true,
      hooks: {
        afterUpdate(token, { transaction }) {
          if (token.get().wrongInput > 3) {
            token.destroy({ transaction })
          }
        },
        afterCreate(token) {
          const timeout = setTimeout(() => {
            if (token.get().id) {
              token.destroy()
            }

            clearTimeout(timeout)
          }, token.duration)
        },
      },
    }
  )

  Object.defineProperty(UserToken.prototype, 'expired', {
    get(this: UserToken) {
      return new Date(this.createdAt).getTime() + this.duration <= Date.now()
    },
  })

  return UserToken
}
