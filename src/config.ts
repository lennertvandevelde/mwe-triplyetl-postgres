// Sync target paramters
import assert from 'assert'

assert(process.env.DB_SCHEME, new Error('ENV VAR DB_SCHEME is undefined.'))
assert(process.env.DB_TABLE, new Error('ENV VAR DB_TABLE is undefined.'))


export const dbExtractScheme = process.env.DB_SCHEME
export const dbExtractTable = process.env.DB_TABLE

// Making sure we have access to the postgresSQL database Source
const dbSource = {
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  url: process.env.DB_URL,
}

export let postgresConnector: any
if (dbSource.url && dbSource.url !== 'None') {
  postgresConnector = { url: dbSource.url }
} else if (dbSource.host) {
  postgresConnector = {
    username: dbSource.username,
    password: dbSource.password,
    host: dbSource.host,
    port: dbSource.port ? +dbSource.port : undefined,
    database: dbSource.database,
    ssl: {
      require: false,
      rejectUnauthorized: false
    }
  }
}
