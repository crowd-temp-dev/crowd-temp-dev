import { Model, ModelStatic } from 'sequelize'
import { User } from './User/User'
import { UserToken } from './User/UserToken'
import { ForgotPassword } from './User/ForgotPassword'
import { TestDetail } from './Project/TestDetail'
import { WelcomeScreen } from './Project/WelcomeScreen'
import { ThankYouScreen } from './Project/ThankYouScreen'
import { CardSorting } from './Project/CardSorting'
import { CustomMessage } from './Project/CustomMessage'
import { DesignSurvey } from './Project/DesignSurvey'
import { FiveSecondTest } from './Project/FiveSecondTest'
import { PreferenceTest } from './Project/PreferenceTest'
import { SimpleSurvey } from './Project/SimpleSurvey'
import { WebsiteEvaluation } from './Project/WebsiteEvaluation'
import { PrototypeEvaluation } from './Project/PrototypeEvaluation'
import { FollowUpQuestion } from './Project/FollowUpQuestions'
import { TemporaryEmail } from './User/TemporaryEmail'
import { File } from './File/File'
import { TestAnswer } from './AnswerTest/Answers'
import { OnboardingVideo } from './OnboardingVideo'
import { UserOnboard } from './User/UserOnboarding'

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

    // user has 1 onboard
    User.hasOne(UserOnboard, {
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
