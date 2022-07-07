import { Sequelize } from 'sequelize'
import { getModules } from '../server-middleware/utils'
import envConfigs from './config'
import setAssociation from './models/setAssociation'
import seedPrivacyAndPolicies from './seed/privacyAndPolicy'
import seedUser from './seed/user'

const NODE_ENV = process.env.NODE_ENV as keyof typeof envConfigs

const config = envConfigs[NODE_ENV]

const ssl =
  process.env.SSL === '1'
    ? {
        dialectOptions: {
          ssl: {
            required: true,
            rejectUnauthorized: false,
          },
        },
      }
    : {}

const DB: Sequelize = config?.url
  ? new Sequelize(config.url, {
      dialect: config.dialect,
      protocol: config.dialect,
      ...ssl,
    })
  : ({ error: true } as unknown as Sequelize)

export const dbCreated = DB instanceof Sequelize

if (dbCreated) {
  getModules({
    directory: [__dirname, '.', 'models'],
    exempt: ['setReferences', 'utils'],
  }).forEach((file) => {
    const initModel = file?.default

    if (typeof initModel === 'function') {
      initModel(DB)
    }
  })
}

export default DB

let dbStarted = false

export function startDB() {
  if (dbStarted) {
    return Promise.resolve()
  }

  dbStarted = true

  return new Promise((resolve, reject) => {
    if (!dbCreated) {
      return reject(new Error('Error creating Database'))
    }

    DB.authenticate()
      .then(() =>
        DB.sync({
          // force: true,
          force: process.env.FORCE_SYNC === '1',
        })
          .then(() => {
            setAssociation()
              .then(async () => {
                await seedUser()

                await seedPrivacyAndPolicies()

                console.log('DB Started!')

                resolve(true)
              })
              .catch((e) => {
                console.log({ AssociationError: e })

                reject(e)
              })
          })
          .catch((e) => {
            console.log({ SyncError: e })

            reject(e)
          })
      )
      .catch((e) => {
        console.log({ AuthenticationError: e })

        reject(e)
      })
  })
}
