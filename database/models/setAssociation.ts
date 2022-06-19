import { Model, ModelStatic } from 'sequelize'
import { User } from './User/User'
import { ConfirmAccount } from './User/ConfirmAccount'
import { ForgotPassword } from './User/ForgotPassword'
import { TestDetail } from './CreateTests/TestDetail'
import { WelcomeScreen } from './CreateTests/WelcomeScreen'
import { ThankYouScreen } from './CreateTests/ThankYouScreen'
import { CardSorting } from './CreateTests/CardSorting'
import { CustomMessage } from './CreateTests/CustomMessage'
import { DesignSurvey } from './CreateTests/DesignSurvey'
import { FiveSecondsTest } from './CreateTests/FiveSecondsTest'
import { PreferenceTest } from './CreateTests/PreferenceTest'
import { SimpleSurvey } from './CreateTests/SimpleSurvey'
import { WebsiteEvaluation } from './CreateTests/WebsiteEvaluation'
import { PrototypeEvaluation } from './CreateTests/PrototypeEvaluation'
import { FollowUpQuestion } from './CreateTests/FollowUpQuestions'
import { TemporaryEmail } from './User/TemporaryEmail'
import { File } from './File/File'
import { TestAnswer } from './AnswerTest/Answers'

type Table = ModelStatic<Model>

export default function () {
  try {
    // a user has 1 slot in ConfirmAccount
    User.hasOne(ConfirmAccount, {
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

    const featureWith1File = [DesignSurvey, FiveSecondsTest]

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

    // featureWith1File has 1 file
    featureWith1File.forEach((Feature: Table) => {
      Feature.hasOne(File, {
        foreignKey: 'createdFor',
        onDelete: 'CASCADE',
      })
    })

    // featuresWithMultipleFiles has multiple files
    featuresWithMultipleFiles.forEach((Feature: Table) => {
      Feature.hasMany(File, {
        foreignKey: 'createdFor',
        onDelete: 'CASCADE',
      })
    })

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
