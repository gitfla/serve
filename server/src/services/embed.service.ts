// src/services/embed.service.ts

import * as sbd from 'sbd'
import { encoding_for_model } from '@dqbd/tiktoken'
import { sql } from 'kysely'
import {embedPrompt, embedSentences} from "./cohere.service";
import {reduceEmbeddings} from "./pca.service";

// --- 1. INIT ---

import db from '../db/database';
const encoder = encoding_for_model('text-embedding-3-small')


// --- 2. UTILS ---

const countTokens = (text: string) => encoder.encode(text).length

const cleanText = (text: string): string => {
    return text
        .replace(/[\r\n]+/g, ' ')              // Replace newlines with spaces
        .replace(/\s+/g, ' ')                  // Collapse multiple spaces
        .replace(/(\s*[\.\?!])(\d+)/g, '$1 $2') // Fix sentence breaks before numbers (e.g. "?1" → "? 1")
        .trim();
}

const splitIntoSentences = (text: string): string[] => {
    const cleaned = cleanText(text);
    const sentences = sbd.sentences(cleaned, {
        newline_boundaries: false, // disable sentence breaks on newlines
        html_boundaries: false,
        sanitize: true,
        allowed_tags: false,
        abbreviations: ['Mr', 'Mrs', 'Dr', 'Ms', 'Prof'],
    });

    // Optional post-filter: remove trivial "sentences" like lone numbers
    return sentences.filter(s => s.trim().length > 2 && !/^\d+\.?$/.test(s.trim()));
}

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
    textId: number,
    startFrom: number
) => {
    const allSentences = splitIntoSentences(fullText)
    const sentences = allSentences.slice(startFrom)
    if (startFrom > 0) {
        console.log(`⏭️ Skipping first ${startFrom} sentences, resuming from index ${startFrom}`)
    }

    if (sentences.length === 0) {
        console.log('✅ All sentences already embedded.')
        return { totalSentences: allSentences.length }
    }

    const chunks = chunkSentences(sentences)

    let sentenceOffset = 0

    for (const chunk of chunks) {
        // 1. Embed first
        const embeddings = await embedSentences(chunk)
        const reducedEmbeddings = await reduceEmbeddings(embeddings)

        // 2. Prepare sentence insert
        const indexedSentences = chunk.map((text, i) => ({
            text,
            text_id: textId,
            sentence_index: startFrom + sentenceOffset + i,
        }))

        // 3. Insert sentences and get their IDs
        const inserted = await db
            .insertInto('sentences')
            .values(indexedSentences)
            .returning(['sentence_id', 'sentence_index'])
            .execute()

        const sentenceIds = inserted.map(row => row.sentence_id)
        const sentenceIndexes = inserted.map(row => row.sentence_index)

        // 4. Insert embeddings using those IDs
        await insertEmbeddingsChunk(writerId, sentenceIds, reducedEmbeddings)

        console.log(`✅ Stored ${embeddings.length} reduced embeddings`)
        console.log(`🔢 sentence_id range: ${sentenceIds[0]}–${sentenceIds[sentenceIds.length - 1]}`)
        console.log(`🔢 sentence_index range: ${sentenceIndexes[0]}–${sentenceIndexes[sentenceIndexes.length - 1]}`)

        sentenceOffset += chunk.length
    }

    return { totalSentences: sentences.length }
}

const insertEmbeddingsChunk = async (
    writerId: number,
    sentenceIds: number[],
    embeddings: number[][]
): Promise<number[]> => {
    if (sentenceIds.length !== embeddings.length) {
        throw new Error('Mismatch between sentence IDs and embeddings')
    }

    const values = embeddings.map((embedding, i) => {
        const sentenceId = sentenceIds[i]
        const vector = sql.raw(`'[${embedding.join(',')}]'::vector`)
        return sql`(${sentenceId}, ${vector}, ${writerId})`
    })

    console.log(`🔹 Inserting ${embeddings.length} embeddings for writer ${writerId}`)
    console.log(`🔹 Embedding shape: [${embeddings[0].length}]`)

    await sql`
    INSERT INTO sentence_embeddings (sentence_id, embedding, writer_id)
    VALUES ${sql.join(values, sql.raw(', '))}
  `.execute(db)

    return sentenceIds
}

export const getLastProcessedSentenceIndex = async (textId: number): Promise<number> => {
    const result = await db
        .selectFrom('sentences')
        .where('text_id', '=', textId)
        .select(db.fn.max('sentence_index').as('max'))
        .executeTakeFirst()

    return result?.max ?? -1 // -1 means start from index 0
}