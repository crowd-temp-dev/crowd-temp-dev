import path from 'path'
import fs from 'fs'
import { Request, RequestHandler, Response } from 'express'
import { UploadedFile } from 'express-fileupload'
import { Transaction } from 'sequelize'
import Joi from 'joi'
import DB from '../../../database'
import { File } from '../../../database/models/File/File'
import { sendError, sendFormattedError } from '../../utils/sendRes'
import { uuidv4 } from '../../utils/validation'

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

      const uploadRoot = path.join(__dirname, '..', '..', '..')

      const uploadPath = ['uploads', ...config.path.split('/').filter(Boolean)]

      const findOrCreateDir = () => {
        return new Promise((resolve, reject) => {
          let index = 0

          while (index < uploadPath.length) {
            const dir = uploadPath[index]

            const currentPath = path.join(
              uploadRoot,
              ...uploadPath.slice(0, index)
            )

            const ls = fs.readdirSync(currentPath)

            if (!ls.includes(dir)) {
              fs.mkdir(path.join(currentPath, dir), (err) => {
                if (err) {
                  index = uploadPath.length

                  reject(new Error('Cannot upload right now'))
                } else {
                  index += 1
                }
              })
            } else {
              index += 1
            }
          }

          resolve(1)
        })
      }

      findOrCreateDir()
        .then(() => {
          const newFiles: Record<string, any>[] = []

          files.forEach((file, index) => {
            const fileExt = (file.name.match(/\.[a-z]+$/g) || [])[0] || ''

            const fileName = `${config.fileNames[index]}${fileExt}`

            const filePath = path.join(uploadRoot, ...uploadPath, fileName)

            file.mv(filePath, (err) => {
              if (err) {
                reject(err)
              }

              newFiles.push({
                ...fileData,
                id: config.fileNames[index],
                name: fileName,
                size: file.size,
                encoding: file.encoding,
                mimetype: file.mimetype,
                path: config.path,
                fullPath: `/${config.path}/${fileName}`.replace(/\/{2,}/g, '/'),
              })

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
        .catch(reject)
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
        const fileInfo = await File.findByPk(id, {
          transaction,
        })

        if (fileInfo) {
          fs.readFile(
            path.join(
              __dirname,
              '..',
              '..',
              '..',
              'uploads',
              fileInfo.fullPath
            ),
            (err, file) => {
              if (err) {
                console.log({ err })

                notFound()
              } else {
                res.writeHead(200, {
                  'Content-Type': fileInfo.mimetype,
                })

                res.end(file)
              }
            }
          )
        } else notFound()
      })
    } catch (err) {
      sendFormattedError(err, res)
    }
  }

  return [formValidation, controller]
}
