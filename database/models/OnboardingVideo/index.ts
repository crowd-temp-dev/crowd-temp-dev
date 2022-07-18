import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  DataTypes,
  Sequelize,
  ModelAttributeColumnOptions,
} from 'sequelize'
import { Uuidv4 } from '../../utils/model'

export class OnboardingVideo extends Model<
  InferAttributes<OnboardingVideo>,
  InferCreationAttributes<OnboardingVideo>
> {
  declare userId?: string
  declare main: number
  declare video1: number
  declare video2: number
  declare video3: number
  declare video4: number
  declare video5: number
  declare hiddenIndexes: number[]
}

const videoConfig = {
  type: DataTypes.REAL(),
  allowNull: false,
  defaultValue: -1,
  validate: {
    min: -2 /** -2 = dont show; -1 = not preference; 0 = dislike; 1 = like **/,
    max: 1,
  },
} as ModelAttributeColumnOptions<OnboardingVideo>

export default function initDesignSurvey(DB: Sequelize) {
  OnboardingVideo.init(
    {
      userId: {
        ...Uuidv4,
        primaryKey: true,
        unique: true,
      },
      main: videoConfig,
      video1: videoConfig,
      video2: videoConfig,
      video3: videoConfig,
      video4: videoConfig,
      video5: videoConfig,
      hiddenIndexes: {
        type: DataTypes.ARRAY(DataTypes.REAL()),
        defaultValue: () => [],
      },
    },
    {
      sequelize: DB,
      timestamps: true,
    }
  )

  return OnboardingVideo
}
