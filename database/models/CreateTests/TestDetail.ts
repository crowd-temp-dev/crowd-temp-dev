import { v4 as uuidv4 } from 'uuid'

import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
  Sequelize,
} from 'sequelize'
import { creatTestProgressRegExpString } from '../../../utils'
import { Uuidv4 } from '../../utils/model'
import { WelcomeScreen } from './WelcomeScreen'
import type { CreateTestProgress } from '~/server-middleware/types'

export class TestDetail extends Model<
  InferAttributes<TestDetail>,
  InferCreationAttributes<TestDetail>
> {
  declare id: CreationOptional<string>
  declare createdBy: string
  declare favourite?: boolean
  declare name: string
  declare published: CreationOptional<boolean>
  declare description: string
  declare shareLink?: string
  declare unlimitedInvites?: boolean
  declare stopAcceptingResponse?: boolean
  declare progress: CreateTestProgress

  declare WelcomeScreen?: WelcomeScreen
}

export default function initTestDetail(DB: Sequelize) {
  TestDetail.init(
    {
      id: {
        ...Uuidv4,
        defaultValue: uuidv4,
        primaryKey: true,
        unique: true,
      },
      published: {
        type: DataTypes.BOOLEAN(),
        defaultValue: false
      },
      createdBy: {
        ...Uuidv4,
        allowNull: false,
      },
      favourite: {
        type: DataTypes.BOOLEAN(),
        defaultValue: false,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      shareLink: {
        type: DataTypes.STRING(),
        unique: true,
        validate: {
          is: /^cid-[a-zA-Z0-9-]+$/,
        },
        allowNull: true
      },
      unlimitedInvites: {
        type: DataTypes.BOOLEAN(),
        defaultValue: false,
      },
      stopAcceptingResponse: {
        type: DataTypes.BOOLEAN(),
        defaultValue: false,
      },
      progress: {
        type: DataTypes.STRING(),
        allowNull: false,
        validate: {
          is: new RegExp(creatTestProgressRegExpString),
        },
      },
    },
    {
      sequelize: DB,
      timestamps: true,
    }
  )

  return TestDetail
}

/**
 * Creating a new test will create a record on this table with the creator's id.
 * Then new requests will be made to other test sections using the id from this new record
 * as a reference.
 * **/
