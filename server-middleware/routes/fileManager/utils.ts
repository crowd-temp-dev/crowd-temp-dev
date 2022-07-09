import path from 'path'
import https from 'https'
import fs from 'fs'
import { Request, RequestHandler, Response } from 'express'
import { UploadedFile } from 'express-fileupload'
import { Transaction } from 'sequelize'
import Joi from 'joi'
import DB from '../../../database'
import { File } from '../../../database/models/File/File'
import { sendError, sendFormattedError } from '../../utils/sendRes'
import { uuidv4 } from '../../utils/validation'
import cloudinary from './cloudinary'

export function uploadFile(arg: {
  req: Request
  transaction: Transaction
  config: {
    path: string
    keys: string[]
    fileNames: string[]
  }
  fileData: {
    createdBy?: string
    createdFor?: string
  }
}) {
  const { config } = arg

  if (!config.path) {
    throw new Error('Invalid upload path!')
  }

  return new Promise((resolve, reject) => {
    const { req } = arg

    const files = (
      Object.entries(req.files)
        .filter(([key]) => config.keys.includes(key))
        .map(([_, value]) => value) as unknown as UploadedFile[]
    ).flat()

    if (files.length) {
      const { fileData } = arg

      // const uploadPath = ['uploads', ...config.path.split('/').filter(Boolean)]

      const newFiles: File[] = []

      files.forEach((file, index) => {
        const fileId = config.fileNames[index]

        const fileExt = (file.name.match(/\.[a-z]+$/g) || [])[0] || ''

        const fileName = `${fileId}${fileExt}`

        const rootDirPaths = [__dirname, '..', '..', 'uploads']

        const rootDir = path.join(...rootDirPaths)

        const createUploadsFolder = () => {
          const hasUploadsFolder = fs
            .readdirSync(
              path.join(...rootDirPaths.slice(0, rootDirPaths.length - 1))
            )
            .includes('uploads')

          if (!hasUploadsFolder) {
            fs.mkdirSync(rootDir)
          }

          return Promise.resolve()
        }

        createUploadsFolder().then(() => {
          const filePath = path.join(rootDir, fileName)

          file.mv(filePath, (err) => {
            if (err) {
              reject(err)
            }

            newFiles.push({
              ...fileData,
              id: fileId,
              name: fileName,
              size: file.size,
              encoding: file.encoding,
              mimetype: file.mimetype,
              path: `/uploads/${config.path}/`.replace(/\/{2,}/, '/'),
              fullPath: `/uploads/${config.path}/${fileName}`.replace(
                /\/{2,}/g,
                '/'
              ),
            } as File)

            if (index === files.length - 1) {
              const { transaction } = arg

              // remove all repeated files before saving new ones to db
              const saveToDB = async () => {
                const filterNewFiles = [
                  ...new Set(
                    newFiles.map((value) => ({
                      name: value.name,
                      size: value.size,
                      mimetype: value.mimetype,
                    }))
                  ),
                ]

                for (const value of filterNewFiles) {
                  await File.destroy({
                    where: {
                      name: value.name,
                      size: value.size,
                      mimetype: value.mimetype,
                    },
                    transaction,
                  })
                }

                for (const file of newFiles) {
                  try {
                    const filePath = path.join(rootDir, `${file.name}`)

                    await cloudinary.uploader.upload(filePath, {
                      public_id: file.id,
                      folder: 'uploads',
                    })

                    fs.unlinkSync(filePath)
                  } catch (err) {
                    console.log({ err })

                    throw new Error('{500} Error uploading file(s)')
                  }
                }

                await File.bulkCreate(newFiles, {
                  transaction: arg.transaction,
                })

                return Promise.resolve()
              }

              saveToDB().then(resolve).catch(reject)
            }
          })
        })
      })
    } else {
      reject(new Error('{400} No file to add'))
    }
  })
}

export function getFileHandler() {
  const formValidation: RequestHandler = (req, res, next) => {
    const params = req.params

    const schema = Joi.object({
      id: uuidv4.required(),
    })

    const validate = schema.validate(params)

    if (validate.error) {
      return sendError(res, {
        message: {
          content: validate.error.message || 'Invalid credentials',
          type: 'error',
        },
        status: 400,
      })
    }

    next()
  }

  const controller = async (req: Request, res: Response) => {
    const { id } = req.params
    try {
      const notFound = () => {
        sendError(res, {
          message: {
            content: 'File not found',
            type: 'error',
          },
          status: 404,
        })
      }

      await DB.transaction(async (transaction) => {
        const fileInfo = await File.findOne({
          where: {
            id,
          },
          transaction,
        })

        if (fileInfo) {
          const url = cloudinary.url(
            `${fileInfo.path}${fileInfo.id}`.replace(/^\//, '')
          )

          https.get(url)
        } else notFound()
      })
    } catch (err) {
      sendFormattedError(err, res)
    }
  }

  return [formValidation, controller]
}
