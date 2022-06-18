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
import { fileTypeRegExpString } from '../../../utils/regexp'
import { convertToByte } from '../../../utils'
import { DesignSurveyFileType } from '../../type'

export class File extends Model<
  InferAttributes<File>,
  InferCreationAttributes<File>
> {
  declare id: CreationOptional<string>
  declare createdBy: string
  declare createdFor: string
  declare type: DesignSurveyFileType
  declare name: string
  declare size: number
  declare data: string
}

export default function initDesignSurvey(DB: Sequelize) {
  File.init(
    {
      id: {
        ...Uuidv4,
        defaultValue: uuidv4,
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
      type: {
        type: DataTypes.STRING(),
        allowNull: false,
        validate: {
          is: new RegExp(fileTypeRegExpString),
        },
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
      data: {
        type: DataTypes.BLOB('long'),
        allowNull: false,
      },
    },
    {
      sequelize: DB,
      timestamps: true,
    }
  )

  return File
}
