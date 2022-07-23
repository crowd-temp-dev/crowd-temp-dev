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

export class WebsiteEvaluation extends Model<
  InferAttributes<WebsiteEvaluation>,
  InferCreationAttributes<WebsiteEvaluation>
> {
  declare id: CreationOptional<string>
  declare testId: string
  declare createdBy: string
  declare index: number
  declare websiteLink: string
  declare task: CreationOptional<string>
}

export default function initWebsiteEvaluation(DB: Sequelize) {
  WebsiteEvaluation.init(
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
      websiteLink: {
        type: DataTypes.STRING(),
        allowNull: false,
        validate: {
          isUrl: {
            msg: 'Please enter a valid website link!',
          },
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

  return WebsiteEvaluation
}
