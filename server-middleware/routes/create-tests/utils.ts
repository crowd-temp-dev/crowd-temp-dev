// eslint-disable-next-line import/named
import Joi from 'joi'
import {
  fileTypeRegExpString,
  frameTypeRegExpString,
} from '../../../utils/regexp'
import { uuidv4 } from '../../utils/validation'
import { CreateTestForm } from '~/types/form'
import { QuestionModelValue } from '~/components/App/CreateTest/Steps/FollowUpQuestion/Question/type'

const likeNumber = Joi.string().pattern(/^\d+$/)

const followUpQuestions = Joi.array()
  .min(1)
  .max(50)
  .items(
    Joi.object({
      question: Joi.string().required(),

      type: Joi.string()
        .pattern(
          /^(?:short-text|long-text|multi-choice|checkbox|linear-scale)$/
        )
        .required(),

      id: Joi.string().uuid().required(),

      conditionalLogic: Joi.boolean().required(),

      required: Joi.boolean().required(),

      conditionals: Joi.object({
        action: Joi.string()
          .pattern(/^(?:goto|show)$/)
          .required(),
        question: Joi.string()
          .pattern(/^\d[a-zA-Z]/)
          .required(),
        questionAnswer: Joi.string().required(),
      } as Record<keyof QuestionModelValue['conditionals'], any>),

      choices: Joi.object({
        addOtherAsChoice: Joi.boolean().required(),

        maxSelection: likeNumber,

        options: Joi.array().min(2).items(Joi.string()).required(),
      } as Record<keyof QuestionModelValue['choices'], any>),

      linearScale: Joi.object({
        type: Joi.string()
          .pattern(/^(?:number|star)$/)
          .required(),

        start: Joi.object({
          label: Joi.string().allow(''),
          value: likeNumber.required(),
        } as Record<keyof QuestionModelValue['linearScale']['start'], any>).required(),

        end: Joi.object({
          label: Joi.string().allow(''),
          value: likeNumber.required(),
        } as Record<keyof QuestionModelValue['linearScale']['end'], any>).required(),
      } as Record<keyof QuestionModelValue['linearScale'], any>),
    } as Record<keyof QuestionModelValue, any>)
  )

export const formSchema = {
  TestDetails: Joi.object({
    name: Joi.string().max(255).required(),
    description: Joi.string().max(255).required(),
  } as Record<keyof CreateTestForm['TestDetails'], any>),

  WelcomeScreen: Joi.object({
    title: Joi.string().max(255).required(),
    message: Joi.string().required(),
    buttonText: Joi.string().max(20).required(),
  } as Record<keyof CreateTestForm['WelcomeScreen'], any>).required(),

  ThankYouScreen: Joi.object({
    title: Joi.string().max(255).min(0),
    message: Joi.string().min(0),
  } as Record<keyof CreateTestForm['ThankYouScreen'], any>),

  SimpleSurvey: Joi.object({
    id: uuidv4.required(),
    followUpQuestions,
  } as Record<keyof CreateTestForm['SimpleSurvey']['0'], any>),

  CardSorting: Joi.object({
    id: uuidv4.required(),
    task: Joi.string().max(255).required(),
    cards: Joi.array().min(2).max(50).items(Joi.string()).required(),
    categories: Joi.array().min(2).max(50).items(Joi.string()).required(),
    followUpQuestions,
  } as Record<keyof CreateTestForm['CardSorting']['0'], any>),

  DesignSurvey: Joi.object({
    id: uuidv4.required(),
    fileType: Joi.string().pattern(new RegExp(fileTypeRegExpString)).required(),
    frameType: Joi.string()
      .pattern(new RegExp(frameTypeRegExpString))
      .required(),
    file: Joi.array().max(1).items(Joi.any()).required(),
    followUpQuestions,
  } as Record<keyof CreateTestForm['DesignSurvey']['0'], any>),

  FiveSecondsTest: Joi.object({
    id: uuidv4.required(),
    duration: Joi.number().min(5000).max(60000).required(),
    file: Joi.array().max(1).items(Joi.any()).required(),
    followUpQuestions,
  } as Record<keyof CreateTestForm['FiveSecondsTest']['0'], any>),

  WebsiteEvaluation: Joi.object({
    id: uuidv4.required(),
    websiteLink: Joi.string().uri().required(),
    task: Joi.string(),
    followUpQuestions,
  } as Record<keyof CreateTestForm['WebsiteEvaluation']['0'], any>),

  PrototypeEvaluation: Joi.object({
    id: uuidv4.required(),
    websiteLink: Joi.string().uri().required(),
    task: Joi.string(),
    followUpQuestions,
  } as Record<keyof CreateTestForm['PrototypeEvaluation']['0'], any>),

  PreferenceTest: Joi.object({
    id: uuidv4.required(),
    files: Joi.array().min(2).max(4).items(Joi.any()).required(),
    followUpQuestions,
  } as Record<keyof CreateTestForm['PreferenceTest']['0'], any>),

  CustomMessage: Joi.object({
    id: uuidv4.required(),
    message: Joi.string().required(),
  } as Record<keyof CreateTestForm['CustomMessage']['0'], any>),
} as Record<keyof CreateTestForm, any>
