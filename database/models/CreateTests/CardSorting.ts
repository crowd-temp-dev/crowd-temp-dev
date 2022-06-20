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

export class CardSorting extends Model<
  InferAttributes<CardSorting>,
  InferCreationAttributes<CardSorting>
> {
  declare id: CreationOptional<string>
  declare createdBy: string
  declare testId: string
  declare index: number
  declare task: string
  declare cards: string[]
  declare categories: string[]
}

export default function initCardSorting(DB: Sequelize) {
  CardSorting.init(
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
      task: {
        type: DataTypes.STRING(),
        allowNull: false,
      },
      cards: {
        type: DataTypes.ARRAY(DataTypes.STRING()),
        allowNull: false,
      },
      categories: {
        type: DataTypes.ARRAY(DataTypes.STRING()),
        allowNull: false,
      },
    },
    {
      sequelize: DB,
      timestamps: true,
    }
  )

  return CardSorting
}
