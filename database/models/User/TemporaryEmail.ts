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

export class TemporaryEmail extends Model<
  InferAttributes<TemporaryEmail>,
  InferCreationAttributes<TemporaryEmail>
> {
  declare id: CreationOptional<string>
  declare userId: string
  declare email: string
  declare expires: CreationOptional<number>
}

export default function initUser(dbInstance: Sequelize) {
  TemporaryEmail.init(
    {
      id: {
        ...Uuidv4,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        unique: true,
      },

      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          isEmail: {
            msg: 'Invalid email format',
          }
        }
      },

      userId: {
        ...Uuidv4,
        unique: true,
      },

      expires: {
        type: DataTypes.REAL(),
        defaultValue: inOneDay,
      },
    },
    {
      sequelize: dbInstance,
      timestamps: true,
    }
  )

  return TemporaryEmail
}
