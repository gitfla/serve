// src/services/embed.service.ts

import { CohereClient } from 'cohere-ai'
import Bottleneck from 'bottleneck'
import * as sbd from 'sbd'
import { encoding_for_model } from '@dqbd/tiktoken'
import { sql } from 'kysely'

// --- 1. INIT ---

const db = require('../db/database');
const cohere = new CohereClient({ token: process.env.COHERE_API_KEY! })
const encoder = encoding_for_model('text-embedding-3-small')

const limiter = new Bottleneck({
    reservoir: 100, // 100 requests per minute
    reservoirRefreshAmount: 100,
    reservoirRefreshInterval: 60 * 1000, // every minute
    maxConcurrent: 1, // serialize requests
})

// --- 2. UTILS ---

const countTokens = (text: string) => encoder.encode(text).length

const splitIntoSentences = (text: string): string[] =>
    sbd.sentences(text, {
        newline_boundaries: true,
        html_boundaries: true,
        sanitize: true,
        allowed_tags: false,
        abbreviations: ['Mr', 'Mrs', 'Dr', 'Ms', 'Prof'],
    })

const chunkSentences = (
    sentences: string[],
    maxBatchSize = 96,
    maxTokens = 32000
): string[][] => {
    const chunks: string[][] = []
    let batch: string[] = []
    let tokenCount = 0

    for (const sentence of sentences) {
        const tokens = countTokens(sentence)
        if (tokens > maxTokens) {
            throw new Error('Text contains sentence that exceeds token limit.')
        }

        if (batch.length >= maxBatchSize || tokenCount + tokens > maxTokens) {
            chunks.push(batch)
            batch = []
            tokenCount = 0
        }

        batch.push(sentence)
        tokenCount += tokens
    }

    if (batch.length > 0) chunks.push(batch)
    return chunks
}

// --- 3. MAIN ---

export const embedText = async (
    fullText: string,
    writerId: number,
    textId: number
) => {
    const sentences = splitIntoSentences(fullText)
    const chunks = chunkSentences(sentences)

    // 1. Insert sentences
    const sentenceIds = await insertSentences(sentences, textId)

    // 2. Embed & store
    let sentenceOffset = 0
    for (const chunk of chunks) {
        const response = await limiter.schedule(() =>
            cohere.embed({
                texts: chunk,
                model: 'embed-english-v3.0',
                inputType: 'search_document',
            })
        )

        if (!response.embeddings || !Array.isArray(response.embeddings)) {
            throw new Error('Invalid embedding response from Cohere')
        }

        const embeddings = response.embeddings as number[][]

        const inserted = await insertEmbeddingsChunk(
            writerId,
            sentenceIds.slice(sentenceOffset, sentenceOffset + chunk.length),
            embeddings
        )

        console.log(`✅ Inserted ${inserted.length} embeddings`)
        sentenceOffset += chunk.length
    }

    return { totalSentences: sentences.length }
}

// --- 4. DB INSERT HELPERS ---

const insertSentences = async (
    sentences: string[],
    textId: number
): Promise<number[]> => {
    const insertData = sentences.map((text, index) => ({
        text,
        text_id: textId,
        sentence_index: index,
    }))

    const inserted = await db
        .insertInto('sentences')
        .values(insertData)
        .returning('sentence_id')
        .execute()

    return inserted.map(row => row.sentence_id)
}

const insertEmbeddingsChunk = async (
    writerId: number,
    sentenceIds: number[],
    embeddings: number[][]
): Promise<number[]> => {
    if (sentenceIds.length !== embeddings.length) {
        throw new Error('Mismatch between sentenceIds and embeddings')
    }

    const rows = sentenceIds.map((sentenceId, i) => {
        const vector = sql.raw(`'[${embeddings[i].join(',')}]'::vector`)
        return sql`(${sentenceId}, ${writerId}, ${vector})`
    })

    await db.executeQuery(sql`
        INSERT INTO sentence_embeddings (sentence_id, writer_id, embedding)
        VALUES ${sql.join(rows, sql.raw(', '))}
    `)

    return sentenceIds
}