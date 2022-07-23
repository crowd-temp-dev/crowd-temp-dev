// eslint-disable-next-line import/named
import Joi from 'joi'
import {
  fileTypeRegExpString,
  frameTypeRegExpString,
} from '../../../utils/regexp'
import { uuidv4 } from '../../utils/validation'
import { ProjectForm } from '~/types/form'
import { QuestionModelValue } from '~/components/App/CreateProject/Steps/FollowUpQuestion/Question/type'

const likeNumber = Joi.string().pattern(/^\d+$/)

const followUpQuestions = Joi.array()
  .min(1)
  .max(50)
  .items(
    Joi.object({
      title: Joi.string().required(),

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
  } as Record<keyof ProjectForm['TestDetails'], any>),

  WelcomeScreen: Joi.object({
    title: Joi.string().max(255).required(),
    message: Joi.string().required(),
    buttonText: Joi.string().max(20).required(),
  } as Record<keyof ProjectForm['WelcomeScreen'], any>).required(),

  ThankYouScreen: Joi.object({
    title: Joi.string().max(255).min(0),
    message: Joi.string().min(0),
  } as Record<keyof ProjectForm['ThankYouScreen'], any>),

  SimpleSurvey: Joi.object({
    id: uuidv4.required(),
    followUpQuestions,
  } as Record<keyof ProjectForm['SimpleSurvey']['0'], any>),

  CardSorting: Joi.object({
    id: uuidv4.required(),
    task: Joi.string().max(255).required(),
    cards: Joi.array().min(2).max(50).items(Joi.string()).required(),
    categories: Joi.array().min(2).max(50).items(Joi.string()).required(),
    followUpQuestions: followUpQuestions.min(0),
  } as Record<keyof ProjectForm['CardSorting']['0'], any>),

  DesignSurvey: Joi.object({
    id: uuidv4.required(),
    fileType: Joi.string().pattern(new RegExp(fileTypeRegExpString)).required(),
    frameType: Joi.string()
      .pattern(new RegExp(frameTypeRegExpString))
      .required(),
    file: Joi.number().integer().min(1).max(1).required(),
    followUpQuestions,
  } as Record<keyof ProjectForm['DesignSurvey']['0'], any>),

  FiveSecondTest: Joi.object({
    id: uuidv4.required(),
    duration: Joi.number().integer().min(5000).max(60000).required(),
    file: Joi.number().integer().min(1).max(1).required(),
    followUpQuestions,
  } as Record<keyof ProjectForm['FiveSecondTest']['0'], any>),

  WebsiteEvaluation: Joi.object({
    id: uuidv4.required(),
    websiteLink: Joi.string().uri({ allowRelative: true }).required(),
    task: Joi.string().allow(''),
    followUpQuestions,
  } as Record<keyof ProjectForm['WebsiteEvaluation']['0'], any>),

  PrototypeEvaluation: Joi.object({
    id: uuidv4.required(),
    prototypeLink: Joi.string().uri().required(),
    prototypeProvider: Joi.string()
      .pattern(/^(?:figma)$/)
      .required(),
    task: Joi.string().allow(''),
    followUpQuestions,
  } as Record<keyof ProjectForm['PrototypeEvaluation']['0'], any>),

  PreferenceTest: Joi.object({
    id: uuidv4.required(),
    files: Joi.number().integer().min(1).required(),
    followUpQuestions,
  } as Record<keyof ProjectForm['PreferenceTest']['0'], any>),

  CustomMessage: Joi.object({
    id: uuidv4.required(),
    message: Joi.string().required(),
    title: Joi.string().required(),
  } as Record<keyof ProjectForm['CustomMessage']['0'], any>),
} as Record<keyof ProjectForm, any>
