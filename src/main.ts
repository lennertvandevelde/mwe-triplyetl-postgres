import { Etl, fromJson, Source } from "@triplyetl/etl/generic";
import { addIri, str, triple } from "@triplyetl/etl/ratt";
import { sdo } from "@triplyetl/etl/vocab";
import { createConnection, toPostgres } from "./helpers.js";
import { postgresConnector } from "./config.js";
import * as os from 'os'
import { dbExtractScheme, dbExtractTable } from './config.js'

function formatMemory(bytes: number): string {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

export default async function (): Promise<Etl> {

    const etl = new Etl()

    etl.use(
        fromJson(
            Source.file('output.json'),
            { toRecords: (json: any) => {
                return json["results"]} }
        ),
        addIri(
            {
                prefix: str('https://test.com/'),
                content: 'id',
                key: 'iri'
            }
        ),
        triple('iri', sdo.identifier, 'id'),
        triple('iri', sdo.givenName, 'givenName'),
        triple('iri', sdo.familyName, 'familyName'),
        async (ctx, next) => {
            ctx
            const totalMemory = os.totalmem();
            const freeMemory = os.freemem();
            const usedMemory = totalMemory - freeMemory;

            console.log(`Used Memory: ${formatMemory(usedMemory)}`);

            return await next()
        },

        toPostgres((record, turtle, sql) => sql`
            UPDATE ${sql(dbExtractScheme)}.${sql(dbExtractTable)}
            SET triples = ${turtle}
            WHERE id = ${record.id}
        `, createConnection(postgresConnector))

    )
    
    return etl
}