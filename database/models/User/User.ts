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

export type UserProvider = 'google' | 'twitter' | 'email'

// eslint-disable-next-line no-use-before-define
export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: CreationOptional<string>
  declare email: string
  declare firstName: string
  declare lastName: string
  declare password: string
  declare role: UserRole
  declare session: UserSession
  declare action: CreationOptional<UserAction>
  declare newsUpdate: boolean
  declare showDashboardGuide?: boolean
  declare confirmed?: boolean
  declare confirmedAt?: number
  declare provider?: UserProvider
  declare loginCount?: number
  declare avatar: CreationOptional<string>
}

const clearInactiveSessions = (user: User) => {
  const sessions = user.getDataValue('session') as UserSession

  if (typeof sessions === 'object') {
    const activeSessions: UserSession = {}

    for (const key in sessions) {
      if (sessions[key].expires > Date.now()) {
        activeSessions[key] = sessions[key]
      }
    }

    user.setDataValue('session', activeSessions)
  }
}

export default function initUser(dbInstance: Sequelize) {
  User.init(
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
        unique: false,
      },

      firstName: {
        type: DataTypes.STRING(255),
        unique: false,
        allowNull: false,
      },

      lastName: {
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

      provider: {
        type: DataTypes.STRING(),
        validate: {
          is: {
            args: /^(?:google|twitter|email)$/,
            msg: 'Invalid provider!',
          },
        },
        allowNull: false,
        defaultValue: 'email',
      },

      loginCount: {
        type: DataTypes.REAL(),
        allowNull: false,
        defaultValue: 0,
      },

      avatar: {
        type: DataTypes.STRING(),
        allowNull: true,
      },
    },
    {
      hooks: {
        beforeFind(user) {
          const { instance } = user

          if (instance) {
            clearInactiveSessions(instance as User)
          }
        },

        beforeUpdate: clearInactiveSessions,
        // beforeDestroy(user) {
        //   const allUsers = path.join(
        //     __dirname,
        //     '..',
        //     '..',
        //     '..',
        //     'uploads',
        //     'user'
        //   )

        //   if (fs.readdirSync(allUsers).includes(user.id)) {
        //     fs.rmSync(path.join(allUsers, user.id), {
        //       recursive: true,
        //       force: true,
        //     })
        //   }
        // },
      },

      sequelize: dbInstance,
      timestamps: true,
    }
  )

  return User
}
