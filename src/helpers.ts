import { Middleware } from '@triplyetl/etl/generic'
import postgres from 'postgres'
import { Destination, DestinationType } from '@triplyetl/etl/generic/locations/destinations'
import { FileSourceInfo } from '@triplyetl/etl/generic/locations/sources'
import * as fs from 'fs'
import { dbExtractScheme, dbExtractTable } from './config.js'



export default function toPostgres(
  id: string,
  sql: postgres.Sql<any>
): Destination {
  return {
    type: 'postgres' as unknown as DestinationType,
    fingerprint: `postgres://${id}` as unknown as `${DestinationType}://${string}`,
    fileInfo: { extension: 'nt', compression: undefined },
    registerSource,
    init: async (_) => {
    //   const options = { ...opts } // make sure we don't overwrite the input
    //   const keys = ['host', 'database', 'username', 'password'] as ['host', 'database', 'username', 'password']
    //   for (const key of keys) {
    //     if (options[key] === undefined) options[key] = process.env['POSTGRES_' + key.toUpperCase()] || undefined
    //   }
    //   if (options.port === undefined && process.env.POSTGRES_PORT !== undefined) { options.port = Number.parseInt(process.env.POSTGRES_PORT) }
    //   sql = options.url === undefined ? postgres(options) : postgres(options.url, options)
    },
    postProcess: async (_app, filesWithMetaData) => {
      filesWithMetaData.forEach((f) => {
        const readStream = fs.createReadStream(f.filename)
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        readStream.on('data', async (chunk) => {
          // console.log(chunk.toString())
          await sql`
                        UPDATE ${sql(dbExtractScheme)}.${sql(dbExtractTable)}
                        SET triples = ${chunk.toString()}
                        WHERE id = ${id} 
            `
        })
        readStream.on('error', (err) => {
          console.error('Error reading file', err)
        })
      }
      )
    }
  }
}

export async function registerSource(source: FileSourceInfo) {
  return { filename: await source.getLocalPath(), remove: false }
}

type Options<T extends Record<string, postgres.PostgresType>> = postgres.Options<T> & {
    url: string
    showParsedOptions: boolean
    skipTrim?: boolean
    skipEnrich?: boolean
  }

export function createConnectionOnce<T extends Record<string, postgres.PostgresType>>(
    opts: Partial<Options<T>> = {}
  ): Middleware {
    let sql: postgres.Sql<any>
  
    const getConnection = async (
    ) => {
      if (!sql) {
        const options = { ...opts } // make sure we don't overwrite the input
        const keys = ['host', 'database', 'username', 'password'] as ['host', 'database', 'username', 'password']
        for (const key of keys) {
          if (options[key] === undefined) options[key] = process.env['POSTGRES_' + key.toUpperCase()] || undefined
        }
        if (options.port === undefined && process.env.POSTGRES_PORT !== undefined) { options.port = Number.parseInt(process.env.POSTGRES_PORT) }
        sql = options.url === undefined ? postgres(options) : postgres(options.url, options)
      }
      return sql
    }
  
    return async function _getConnection(ctx, next) {
      ctx.record.connection = await getConnection()
      return await next()
    }
  }