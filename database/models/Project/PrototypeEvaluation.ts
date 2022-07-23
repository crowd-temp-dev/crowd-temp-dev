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

export class PrototypeEvaluation extends Model<
  InferAttributes<PrototypeEvaluation>,
  InferCreationAttributes<PrototypeEvaluation>
> {
  declare id: CreationOptional<string>
  declare testId: string
  declare createdBy: string
  declare index: number
  declare prototypeLink: string
  declare prototypeProvider: 'figma'
  declare task: CreationOptional<string>
}

export default function initPrototypeEvaluation(DB: Sequelize) {
  PrototypeEvaluation.init(
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
      createdBy: {
        ...Uuidv4,
        allowNull: false,
      },
      index: {
        type: DataTypes.REAL(),
        allowNull: false,
        validate: {
          min: 0,
          max: 49,
        },
      },
      prototypeLink: {
        type: DataTypes.STRING(),
        allowNull: false,
        validate: {
          is: /^(?:https:\/\/([\w.-]+\.)?figma.com\/(file|proto)\/([0-9a-zA-Z]{22,128})(?:\/.*))?$/,
        },
      },
      prototypeProvider: {
        type: DataTypes.STRING(),
        allowNull: false,
        validate: {
          is: /^(?:figma)$/,
        },
      },
      task: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize: DB,
      timestamps: true,
    }
  )

  return PrototypeEvaluation
}
