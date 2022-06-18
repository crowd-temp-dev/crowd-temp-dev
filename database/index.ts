import { Sequelize } from 'sequelize'
import { getModules } from '../server-middleware/utils'
import envConfigs from './config'
import setAssociation from './models/setAssociation'
import seedUser from './seed/user'

const NODE_ENV = process.env.NODE_ENV as keyof typeof envConfigs

const config = envConfigs[NODE_ENV]

const DB: Sequelize = config?.url
  ? new Sequelize(config.url, {
      dialect: config.dialect,
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

  return new Promise((resolve, reject) => {
    if (!dbCreated) {
      return reject(new Error('Error creating Database'))
    }

    dbStarted = true

    DB.authenticate()
      .then(() =>
        DB.sync({
          // force: true,
          // force: NODE_ENV === 'test',
        })
          .then(() => setAssociation().then(() => {
            resolve(true)

            seedUser()

            console.log({HERE_HAS_REACHED_OOOOO: true});
            
          }).catch(reject))
          .catch(reject)
      )
      .catch(reject)
  })
}
