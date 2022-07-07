import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  DataTypes,
  Sequelize,
} from 'sequelize'

interface Section {
  title: string
  content: (string | string[] | Section)[]
}

export class PrivacyAndPolicy extends Model<
  InferAttributes<PrivacyAndPolicy>,
  InferCreationAttributes<PrivacyAndPolicy>
> {
  declare intro: [string, string]
  declare sections: Section[]
  declare updatedAt?: string
}

export default function initDesignSurvey(DB: Sequelize) {
  PrivacyAndPolicy.init(
    {
      intro: {
        type: DataTypes.ARRAY(DataTypes.TEXT()),
        allowNull: false,
      },
      sections: {
        type: DataTypes.ARRAY(DataTypes.JSON()),
        allowNull: false,
      },
    },
    {
      sequelize: DB,
      timestamps: true,
    }
  )

  return PrivacyAndPolicy
}
