import { Model, ModelStatic } from 'sequelize'
import { User } from './User/User'
import { UserToken } from './User/UserToken'
import { ForgotPassword } from './User/ForgotPassword'
import { TestDetail } from './CreateTests/TestDetail'
import { WelcomeScreen } from './CreateTests/WelcomeScreen'
import { ThankYouScreen } from './CreateTests/ThankYouScreen'
import { CardSorting } from './CreateTests/CardSorting'
import { CustomMessage } from './CreateTests/CustomMessage'
import { DesignSurvey } from './CreateTests/DesignSurvey'
import { FiveSecondTest } from './CreateTests/FiveSecondTest'
import { PreferenceTest } from './CreateTests/PreferenceTest'
import { SimpleSurvey } from './CreateTests/SimpleSurvey'
import { WebsiteEvaluation } from './CreateTests/WebsiteEvaluation'
import { PrototypeEvaluation } from './CreateTests/PrototypeEvaluation'
import { FollowUpQuestion } from './CreateTests/FollowUpQuestions'
import { TemporaryEmail } from './User/TemporaryEmail'
import { File } from './File/File'
import { TestAnswer } from './AnswerTest/Answers'
import { OnboardingVideo } from './OnboardingVideo'
import { UserSurvey } from './User/UserSurvey'

type Table = ModelStatic<Model>

let called = false

export default function () {
  try {
    if (called) {
      return Promise.resolve()
    }

    called = true

    // a user has 1 slot in Token
    User.hasOne(UserToken, {
      foreignKey: 'userId',
      onDelete: 'CASCADE',
    })

    // a user has 1 slot for ForgotPassword
    User.hasOne(ForgotPassword, {
      foreignKey: 'userId',
      onDelete: 'CASCADE',
    })

    // a user has 1 slot for TemporaryEmail
    User.hasOne(TemporaryEmail, {
      foreignKey: 'userId',
      onDelete: 'CASCADE',
    })

    // a user has 1 slot for OnboardingVideo
    User.hasOne(OnboardingVideo, {
      foreignKey: 'userId',
      onDelete: 'CASCADE',
    })

    // a user has many TestDetail (test)
    User.hasMany(TestDetail, {
      foreignKey: 'createdBy',
      onDelete: 'CASCADE',
    })

    // a user has many files
    User.hasMany(File, {
      foreignKey: 'createdBy',
      onDelete: 'CASCADE',
    })

    // user has 1 usersurvey
    User.hasOne(UserSurvey, {
      foreignKey: 'id',
      onDelete: 'CASCADE',
    })

    // a test detail has multiple answers
    TestDetail.hasMany(TestAnswer, {
      foreignKey: 'testId',
      onDelete: 'CASCADE',
    })

    // a test detail has 1 welcome screen
    TestDetail.hasOne(WelcomeScreen, {
      foreignKey: 'testId',
      onDelete: 'CASCADE',
    })

    // a test detail has 1 thank you screen
    TestDetail.hasOne(ThankYouScreen, {
      foreignKey: 'testId',
      onDelete: 'CASCADE',
    })

    const featureWith1File = [FiveSecondTest, DesignSurvey]

    const featuresWithMultipleFiles = [PreferenceTest]

    const featuresWithQuestions = [
      ...featureWith1File,
      ...featuresWithMultipleFiles,
      SimpleSurvey,
      CardSorting,
      PrototypeEvaluation,
      WebsiteEvaluation,
    ]

    const allFeatures = [...featuresWithQuestions, CustomMessage]

    // TestDetail has many test features.
    allFeatures.forEach((Feature: Table) => {
      TestDetail.hasMany(Feature, {
        foreignKey: 'testId',
        onDelete: 'CASCADE',
      })
    })

    TestDetail.hasMany(File, {
      foreignKey: 'createdFor',
    })

    // featureWith1File has 1 file
    // featureWith1File.forEach((Feature: Table) => {
    //   Feature.hasOne(File, {
    //     foreignKey: 'createdFor',
    //     onDelete: 'CASCADE',
    //   })
    // })

    // featuresWithMultipleFiles has multiple files
    // featuresWithMultipleFiles.forEach((Feature: Table) => {
    // Feature.hasMany(File, {
    //   foreignKey: 'createdFor',
    //   onDelete: 'CASCADE',
    //   as: Feature.tableName
    // })

    // File.hasMany(Feature, {
    //   foreignKey: 'id',
    //   onDelete: 'CASCADE',
    // })
    // })

    // each test Feature here has many FollowUpQuestion
    featuresWithQuestions.forEach((Feature: Table) => {
      Feature.hasMany(FollowUpQuestion, {
        onDelete: 'CASCADE',
      })

      FollowUpQuestion.belongsTo(Feature, {
        onDelete: 'CASCADE',
      })
    })

    return Promise.resolve()
  } catch (e) {
    return Promise.reject(e)
  }
}
