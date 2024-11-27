import { Context, Middleware, NextFn } from '@triplyetl/etl/generic'
import postgres from 'postgres'
import { Writer } from 'n3'

export function createConnection(
    opts: any
  ): postgres.Sql<any> {
    const options = { ...opts } // make sure we don't overwrite the input
    const keys = ['host', 'database', 'username', 'password'] as ['host', 'database', 'username', 'password']
    for (const key of keys) {
      if (options[key] === undefined) options[key] = process.env['POSTGRES_' + key.toUpperCase()] || undefined
    }
    if (options.port === undefined && process.env.POSTGRES_PORT !== undefined) { options.port = Number.parseInt(process.env.POSTGRES_PORT) }
    return options.url === undefined ? postgres(options) : postgres(options.url, options) as postgres.Sql<any>
  }


type Callback = (record: Record<string, any>, turtle: string, sql: postgres.Sql<any>) => Promise<postgres.RowList<postgres.Row[]>>

export function toPostgres (callback: Callback, connection: postgres.Sql<any>): Middleware {
    return async (context: Context, next: NextFn) => {
        const writer = new Writer()
        const turtle = await writer.quadsToString([...context.store])

        function queryTaggedTemplateLiteral (strings: TemplateStringsArray, ...holes: readonly any[]) {
            return connection(strings, ...holes)
        }
        
        await callback(context.record, turtle, queryTaggedTemplateLiteral as postgres.Sql<any>)
        return next()
    }
}
