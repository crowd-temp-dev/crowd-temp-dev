import { v4 as uuidv4 } from 'uuid'
import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
  Sequelize,
} from 'sequelize'
import type { QuestionModelValue } from '../../../components/App/CreateProject/Steps/FollowUpQuestion/Question/type'
import { Uuidv4 } from '../../utils/model'
import { questionTypeRegExpString } from '../../../utils/regexp'

export class FollowUpQuestion extends Model<
  InferAttributes<FollowUpQuestion>,
  InferCreationAttributes<FollowUpQuestion>
> {
  declare id: CreationOptional<string>
  declare title: string
  declare type: QuestionModelValue['type']
  declare conditionalLogic: boolean
  declare required: boolean
  declare conditionals: QuestionModelValue['conditionals']
  declare choices: QuestionModelValue['choices']
  declare linearScale: QuestionModelValue['linearScale']

  declare SimpleSurveyId: CreationOptional<string>
  declare CardSortingId: CreationOptional<string>
  declare PrototypeEvaluationId: CreationOptional<string>
  declare WebsiteEvaluationId: CreationOptional<string>
  declare DesignSurveyId: CreationOptional<string>
  declare FiveSecondTestId: CreationOptional<string>
  declare PreferenceTestId: CreationOptional<string>
}

const defineQuestion = () => ({
  ...Uuidv4,
  allowNull: true,
})

export default function initFollowUpQuestion(DB: Sequelize) {
  FollowUpQuestion.init(
    {
      id: {
        ...Uuidv4,
        defaultValue: uuidv4,
        primaryKey: true,
        unique: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING(),
        allowNull: false,
        validate: {
          is: new RegExp(questionTypeRegExpString),
        },
      },
      conditionalLogic: {
        type: DataTypes.BOOLEAN(),
        allowNull: false,
      },
      required: {
        type: DataTypes.BOOLEAN(),
        allowNull: false,
      },
      conditionals: {
        type: DataTypes.JSON(),
        allowNull: true,
      },
      choices: {
        type: DataTypes.JSON(),
        allowNull: true,
      },
      linearScale: {
        type: DataTypes.JSON(),
        allowNull: true,
      },

      SimpleSurveyId: defineQuestion(),
      CardSortingId: defineQuestion(),
      DesignSurveyId: defineQuestion(),
      FiveSecondTestId: defineQuestion(),
      PreferenceTestId: defineQuestion(),
      PrototypeEvaluationId: defineQuestion(),
      WebsiteEvaluationId: defineQuestion(),
    },
    {
      sequelize: DB,
      timestamps: true,
    }
  )

  return FollowUpQuestion
}
