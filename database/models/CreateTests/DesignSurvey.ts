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
import { fileTypeRegExpString, frameTypeRegExpString } from '../../../utils/regexp'
import { DesignSurveyFileType, DesignSurveyFrameType } from '../../type'

export class DesignSurvey extends Model<
  InferAttributes<DesignSurvey>,
  InferCreationAttributes<DesignSurvey>
> {
  declare id: CreationOptional<string>
  declare createdBy: string
  declare testId: string
  declare index: number
  declare questionIds: string[]
  declare fileType: DesignSurveyFileType
  declare frameType: DesignSurveyFrameType
  declare fileURL: string
}

export default function initDesignSurvey(DB: Sequelize) {
  DesignSurvey.init(
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
      questionIds: {
        type: DataTypes.ARRAY(DataTypes.UUID()),
        allowNull: false,
      },
      fileType: {
        type: DataTypes.STRING(),
        allowNull: false,
        validate: {
          is: new RegExp(fileTypeRegExpString),
        },
      },
      frameType: {
        type: DataTypes.STRING(),
        allowNull: false,
        validate: {
          is: new RegExp(frameTypeRegExpString),
        },
      },
      fileURL: {
        ...Uuidv4,
        allowNull: false,
      },
    },
    {
      sequelize: DB,
      timestamps: true,
    }
  )

  return DesignSurvey
}
