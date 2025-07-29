import { db } from './database' // your initialized Kysely DB instance
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

    await sql`
        INSERT INTO sentence_embeddings (writer_id, sentence, embedding)
        VALUES ${joined}
  `.execute(db)
}

/*
// src/db/insertEmbeddingsChunk.ts
import { db } from './db'
import { sql } from 'kysely'

export async function insertEmbeddingsChunk(
  writerId: number,
  sentenceIds: number[],
  embeddings: number[][]
) {
  if (sentenceIds.length !== embeddings.length) {
    throw new Error(`Mismatched sentence IDs (${sentenceIds.length}) and embeddings (${embeddings.length})`)
  }

  const valuesSql = embeddings.map((embedding, i) =>
    sql`(
      ${sentenceIds[i]},
      ${sql.raw(`'[${embedding.join(',')}]'::vector`)},
      ${writerId}
    )`
  )

  const joined = sql.join(valuesSql, sql.raw(','))

  await db.executeQuery(
    sql`
      INSERT INTO sentence_embeddings (sentence_id, embedding, writer_id)
      VALUES ${joined}
    `
  )
}
 */