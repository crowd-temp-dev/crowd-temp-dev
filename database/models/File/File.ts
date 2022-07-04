import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  DataTypes,
  Sequelize,
} from 'sequelize'
import { Uuidv4 } from '../../utils/model'
import { convertToByte } from '../../../utils'

export class File extends Model<InferAttributes<File>, InferCreationAttributes<File>> {
  declare id?: string
  declare createdBy: string
  declare createdFor: string
  declare name: string
  declare size: number
  declare encoding: string
  declare mimetype: string
  declare path: string
  declare fullPath: string
}

export default function initDesignSurvey(DB: Sequelize) {
  File.init(
    {
      id: {
        type: DataTypes.STRING(500),
        validate: {
          is: {
            msg: 'Invalid File ID',
            args: /^f.+(\?).+(=).+(&).+$/,
          },
        },
        primaryKey: true,
        unique: true,
      },
      createdBy: {
        ...Uuidv4,
        allowNull: false,
      },
      createdFor: {
        ...Uuidv4,
        allowNull: true,
      },

      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      size: {
        type: DataTypes.REAL(),
        allowNull: false,
        validate: {
          min: {
            args: [1],
            msg: 'File must be more than 1byte',
          },
          max: {
            args: [convertToByte('1gb')],
            msg: 'File must be less than 1gb',
          },
        },
      },
      encoding: {
        type: DataTypes.STRING(),
        allowNull: false,
      },
      mimetype: {
        type: DataTypes.STRING(),
        allowNull: false,
      },
      path: {
        type: DataTypes.STRING(),
        allowNull: false,
        validate: {
          is: /^\/.+\/$/,
        },
      },
      fullPath: {
        type: DataTypes.STRING(),
        allowNull: false,
        validate: {
          is: /^\/.+\/$/,
        },
      },
    },
    {
      sequelize: DB,
      timestamps: true,
    }
  )

  return File
}
