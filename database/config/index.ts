import { Dialect } from 'sequelize/types'

const envConfigs = {
  development: {
    url: process.env.DEV_DATABASE_URL as string,
    dialect: process.env.DB_DIALECT as Dialect,
  },
  test: {
    url: process.env.TEST_DATABASE_URL as string,
    dialect: process.env.DB_DIALECT as Dialect,
  },
  production: {
    url: process.env.DATABASE_URL as string,
    dialect: process.env.DB_DIALECT as Dialect,
  },
}

export default envConfigs
