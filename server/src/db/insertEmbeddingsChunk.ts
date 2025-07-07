import { db } from './db' // your initialized Kysely DB instance
import { sql } from 'kysely'

export async function insertEmbeddingsChunk(writerId: number,
                                            sentences: string[],
                                            embeddings: number[][],
                                            sentenceOffset?: number) {
    const valuesSql = embeddings.map((record, i) =>
        sql`(
      ${writerId},
      ${sentences},
      ${sql.raw(`'[${embeddings.join(',')}]'::vector`)}
    )`
    )

    const joined = sql.join(valuesSql, sql.raw(','))

    await db.executeQuery(
        sql`
      INSERT INTO sentence_embeddings (writer_id, sentence, embedding)
      VALUES ${joined}
    `
    )
}