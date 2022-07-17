import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  DataTypes,
  CreationOptional,
  Sequelize,
} from 'sequelize'
import { Uuidv4 } from '../../utils/model'
import { userCompanySize, userReferrer, userWorkRole } from '../../../utils'

// eslint-disable-next-line no-use-before-define
export class UserSurvey extends Model<
  InferAttributes<UserSurvey>,
  InferCreationAttributes<UserSurvey>
> {
  declare id: CreationOptional<string>
  declare useCase: string
  declare role: string
  declare companyName: CreationOptional<string>
  declare companySize: CreationOptional<string>
  declare referrer: string
}

export default function initUserSurvey(dbInstance: Sequelize) {
  UserSurvey.init(
    {
      id: {
        ...Uuidv4,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        unique: true,
      },
      useCase: {
        type: DataTypes.STRING(),
        allowNull: false,
        validate: {
          is: {
            args: /^(?:Work|Personal|Education)$/,
            msg: 'Invalid useCase!',
          },
        },
      },
      role: {
        type: DataTypes.STRING(),
        allowNull: false,
        validate: {
          is: {
            args: new RegExp(`^(?:${userWorkRole.join('|')})$`),
            msg: 'Invalid role!',
          },
        },
      },
      companyName: {
        type: DataTypes.STRING(99),
        allowNull: true,
      },
      companySize: {
        type: DataTypes.STRING(),
        allowNull: true,
        validate: {
          is: {
            args: new RegExp(
              `^(?:${userCompanySize.map((x) => x.value).join('|')})$`
            ),
            msg: 'Invalid company size!',
          },
        },
      },
      referrer: {
        type: DataTypes.STRING(),
        allowNull: false,
        validate: {
          is: {
            args: new RegExp(`^(?:${userReferrer.join('|')})$`),
            msg: 'Invalid referrer!',
          },
        },
      },
    },
    {
      sequelize: dbInstance,
      timestamps: true,
    }
  )

  return UserSurvey
}
