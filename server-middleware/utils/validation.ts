/* eslint-disable prefer-regex-literals */
import Joi from 'joi'
import {
  confirmDeleteAccountRegExp,
  emailRegExpString,
  passwordRegExpString,
  roleRegExpString,
} from '../../utils'

export const sensitiveString = Joi.string()
  .trim()
  .pattern(/^[\s\w\d@!-.]+?$/i)
  .rule({ message: 'Invalid characters' })

export const uuidv4 = Joi.string()
  .uuid({
    version: 'uuidv4',
  })
  .rule({
    message: 'Invalid uuid!',
  })

export const user = {
  name: sensitiveString
    .min(1)
    .max(99)
    .pattern(new RegExp('^([a-zA-Z0-9\\s]){2,255}$'))
    .rule({ message: 'Name should be between 3 and 255 characters.' }),

  password: Joi.string()
    .min(8)
    .max(32)
    .pattern(new RegExp(passwordRegExpString)),

  email: Joi.string().min(3).max(150).pattern(new RegExp(emailRegExpString)),

  confirmDeleteAccount: sensitiveString.pattern(
    new RegExp(confirmDeleteAccountRegExp)
  ),

  role: sensitiveString.pattern(new RegExp(roleRegExpString)),
}
